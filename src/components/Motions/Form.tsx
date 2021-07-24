import { useState, useEffect } from "react";
import { useLazyQuery, useMutation, useReactiveVar } from "@apollo/client";
import {
  FormGroup,
  NativeSelect,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import Router from "next/router";
import { Formik, FormikHelpers, Form, Field, FormikProps } from "formik";

import Messages from "../../utils/messages";
import { IMAGES_BY_MOTION_ID } from "../../apollo/client/queries";
import {
  CREATE_MOTION,
  UPDATE_MOTION,
  DELETE_IMAGE,
} from "../../apollo/client/mutations";
import { Common, Motions } from "../../constants";
import ActionFields from "./ActionFields";
import styles from "../../styles/Shared/Shared.module.scss";
import { feedVar, paginationVar } from "../../apollo/client/localState";
import { useCurrentUser } from "../../hooks";
import { generateRandom } from "../../utils/common";
import { noCache } from "../../utils/apollo";
import SubmitButton from "../Shared/SubmitButton";
import TextField from "../Shared/TextField";
import SelectedImages from "../Shared/SelectedImages";
import ImageInput from "../Shared/ImageInput";

interface FormikValues {
  body: string;
}

interface Props {
  motion?: Motion;
  motions?: Motion[];
  isEditing?: boolean;
  setMotions?: (motions: Motion[]) => void;
  group?: Group;
}

const MotionsForm = ({
  motion,
  motions,
  isEditing,
  setMotions,
  group,
}: Props) => {
  const currentUser = useCurrentUser();
  const [imagesInputKey, setImagesInputKey] = useState<string>("");
  const [savedImages, setSavedImages] = useState<Image[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [action, setAction] = useState<string>("");
  const [actionData, setActionData] = useState<ActionData>({});
  const { currentPage, pageSize } = useReactiveVar(paginationVar);
  const feed = useReactiveVar(feedVar);

  const [createMotion] = useMutation(CREATE_MOTION);
  const [updateMotion] = useMutation(UPDATE_MOTION);
  const [deleteImage] = useMutation(DELETE_IMAGE);
  const [getSavedImagesRes, savedImagesRes] = useLazyQuery(
    IMAGES_BY_MOTION_ID,
    noCache
  );

  useEffect(() => {
    if (isEditing && motion) {
      setAction(motion.action);
    }
  }, [motion, isEditing]);

  useEffect(() => {
    if (motion) getSavedImagesRes({ variables: { motionId: motion.id } });
  }, []);

  useEffect(() => {
    setSavedImages(
      savedImagesRes.data ? savedImagesRes.data.imagesByMotionId : []
    );
  }, [savedImagesRes.data]);

  const handleSubmit = async (
    { body }: FormikValues,
    { setSubmitting, resetForm }: FormikHelpers<FormikValues>
  ) => {
    if (currentUser) {
      try {
        if (isEditing && motion) {
          await updateMotion({
            variables: {
              id: motion.id,
              body,
              action,
              actionData,
              images,
            },
          });
          Router.push(`/motions/${motion.id}`);
        } else {
          const { data } = await createMotion({
            variables: {
              body,
              images,
              action,
              actionData,
              groupId: group?.id,
              userId: currentUser.id,
            },
          });
          resetForm();
          setAction("");
          setImages([]);
          setSubmitting(false);
          if (motions && setMotions)
            setMotions([data.createMotion.motion, ...motions]);
          else
            feedVar({
              ...feed,
              items: feedItemsAferCreate(data.createMotion.motion),
              totalItems: feed.totalItems + 1,
            });
        }
      } catch (err) {
        alert(err);
      }
    }
  };

  const handleActionChange = (event: React.ChangeEvent<{ value: string }>) => {
    setAction(event.target.value);
  };

  const deleteImageHandler = async (id: string) => {
    await deleteImage({
      variables: {
        id,
      },
    });
    setSavedImages(savedImages.filter((image: Image) => image.id !== id));
  };

  const removeSelectedImage = (imageName: string) => {
    setImages(
      [...images].filter((image) => {
        return image.name !== imageName;
      })
    );
    setImagesInputKey(generateRandom());
  };

  const isSubmitButtonDisabled = (
    formik: FormikProps<FormikValues>
  ): boolean => {
    if (isEditing && !!formik.submitCount) return true;
    return formik.isSubmitting;
  };

  const feedItemsAferCreate = (newMotion: Motion): FeedItem[] => {
    let { items, totalItems } = feed;
    const totalPages = Math.ceil(totalItems / pageSize);
    const onLastPage = currentPage === totalPages - 1;
    if (totalItems > items.length && !onLastPage) items = items.slice(0, -1);
    return [newMotion, ...items];
  };

  return (
    <Formik
      initialValues={{
        body: isEditing && motion ? motion.body : "",
      }}
      onSubmit={handleSubmit}
    >
      {(formik) => (
        <Form className={styles.form} style={group && { marginTop: "48px" }}>
          <FormGroup>
            <Field
              name={Common.FieldNames.Body}
              placeholder={
                formik.isSubmitting
                  ? Messages.states.loading()
                  : Messages.motions.form.makeAMotion()
              }
              component={TextField}
              multiline
              style={{ marginBottom: 0 }}
            />

            <FormControl style={{ marginBottom: "18px" }}>
              <InputLabel>{Messages.motions.form.motionType()}</InputLabel>
              <NativeSelect value={action} onChange={handleActionChange}>
                <option aria-label={Messages.forms.none()} value="" />
                <option value={Motions.ActionTypes.PlanEvent}>
                  {Messages.motions.form.actionTypes.planEvent()}
                </option>
                <option value={Motions.ActionTypes.ChangeName}>
                  {Messages.motions.form.actionTypes.changeName()}
                </option>
                <option value={Motions.ActionTypes.ChangeDescription}>
                  {Messages.motions.form.actionTypes.changeDescription()}
                </option>
                <option value={Motions.ActionTypes.ChangeImage}>
                  {Messages.motions.form.actionTypes.changeImage()}
                </option>
                <option value={Motions.ActionTypes.ChangeSettings}>
                  {Messages.motions.form.actionTypes.changeSettings()}
                </option>
                <option value={Motions.ActionTypes.Test}>
                  {Messages.motions.form.actionTypes.test()}
                </option>
              </NativeSelect>
            </FormControl>

            <ActionFields actionType={action} setActionData={setActionData} />

            {action !== Motions.ActionTypes.ChangeImage && (
              <ImageInput
                setImages={setImages}
                refreshKey={imagesInputKey}
                multiple
              />
            )}
          </FormGroup>

          <SelectedImages
            selectedImages={images}
            savedImages={savedImages}
            removeSelectedImage={removeSelectedImage}
            deleteSavedImage={deleteImageHandler}
          />

          <SubmitButton disabled={isSubmitButtonDisabled(formik)}>
            {isEditing
              ? Messages.actions.save()
              : Messages.motions.actions.motion()}
          </SubmitButton>
        </Form>
      )}
    </Formik>
  );
};

export default MotionsForm;
