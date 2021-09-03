import { useState, useEffect } from "react";
import { useLazyQuery, useMutation, useReactiveVar } from "@apollo/client";
import {
  FormGroup,
  FormControl,
  InputLabel,
  Divider,
  MenuItem,
} from "@material-ui/core";
import Router, { useRouter } from "next/router";
import { Formik, FormikHelpers, Form, Field, FormikProps } from "formik";

import Messages from "../../utils/messages";
import { IMAGES_BY_MOTION_ID } from "../../apollo/client/queries";
import {
  CREATE_MOTION,
  UPDATE_MOTION,
  DELETE_IMAGE,
} from "../../apollo/client/mutations";
import {
  FieldNames,
  NavigationPaths,
  ResourcePaths,
} from "../../constants/common";
import { ActionTypeOptions, ActionTypes } from "../../constants/motion";
import ActionFields from "./ActionFields";
import styles from "../../styles/Motion/Motion.module.scss";
import { feedVar, paginationVar } from "../../apollo/client/localState";
import { useCurrentUser } from "../../hooks";
import { generateRandom } from "../../utils/common";
import { noCache } from "../../utils/apollo";
import SubmitButton from "../Shared/SubmitButton";
import TextField from "../Shared/TextField";
import SelectedImages from "../Images/Selected";
import ImageInput from "../Images/Input";
import Dropdown from "../Shared/Dropdown";
import { truncate } from "lodash";

interface FormValues {
  body: string;
}

export interface MotionsFormProps {
  motion?: Motion;
  motions?: Motion[];
  isEditing?: boolean;
  setMotions?: (motions: Motion[]) => void;
  groups?: Group[];
  group?: Group;
  closeModal?: () => void;
}

const MotionsForm = ({
  motion,
  motions,
  isEditing,
  setMotions,
  groups,
  group,
  closeModal,
}: MotionsFormProps) => {
  const currentUser = useCurrentUser();
  const [imagesInputKey, setImagesInputKey] = useState<string>("");
  const [savedImages, setSavedImages] = useState<Image[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [action, setAction] = useState<string>("");
  const [actionData, setActionData] = useState<ActionData>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const { currentPage, pageSize } = useReactiveVar(paginationVar);
  const feed = useReactiveVar(feedVar);

  const [createMotion] = useMutation(CREATE_MOTION);
  const [updateMotion] = useMutation(UPDATE_MOTION);
  const [deleteImage] = useMutation(DELETE_IMAGE);
  const [getSavedImagesRes, savedImagesRes] = useLazyQuery(
    IMAGES_BY_MOTION_ID,
    noCache
  );
  const { asPath: currentPath } = useRouter();

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
    { body }: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
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
          Router.push(`${ResourcePaths.Motion}${motion.id}`);
        } else {
          const { data } = await createMotion({
            variables: {
              body,
              images,
              action,
              actionData,
              userId: currentUser.id,
              groupId: group ? group.id : selectedGroupId,
            },
          });
          resetForm();
          setAction("");
          setImages([]);
          setSelectedGroupId("");
          setSubmitting(false);
          if (motions && setMotions)
            setMotions([data.createMotion.motion, ...motions]);
          else
            feedVar({
              ...feed,
              items: feedItemsAferCreate(data.createMotion.motion),
              totalItems: feed.totalItems + 1,
            });

          if (groups && selectedGroupId && closeModal) {
            closeModal();
            if (currentPath !== NavigationPaths.Home)
              Router.push(NavigationPaths.Home);
          }
        }
      } catch (err) {
        alert(err);
      }
    }
  };

  const handleActionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAction(event.target.value as string);
  };

  const handleGroupChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedGroupId(event.target.value as string);
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

  const isSubmitButtonDisabled = ({
    values: { body },
    isValid,
    isSubmitting,
  }: FormikProps<FormValues>): boolean => {
    if (!group && !selectedGroupId) return true;
    if (body === "" && images.length === 0) return true;
    if (!isValid) return true;
    return isSubmitting;
  };

  const feedItemsAferCreate = (newMotion: Motion): FeedItem[] => {
    let { items, totalItems } = feed;
    const totalPages = Math.ceil(totalItems / pageSize);
    const onLastPage = currentPage === totalPages - 1;
    if (totalItems > items.length && !onLastPage) items = items.slice(0, -1);
    return [newMotion, ...items];
  };

  const validateBody = (body: string) => {
    return body === "" && images.length === 0
      ? Messages.motions.form.motionEmpty()
      : undefined;
  };

  return (
    <Formik
      initialValues={{
        body: isEditing && motion ? motion.body : "",
      }}
      onSubmit={handleSubmit}
    >
      {(formik) => (
        <Form className={styles.form}>
          <FormGroup>
            <Field
              name={FieldNames.Body}
              placeholder={
                formik.isSubmitting
                  ? Messages.states.loading()
                  : Messages.motions.form.makeAMotion()
              }
              component={TextField}
              validate={validateBody}
              style={{ marginBottom: 3 }}
              multiline
            />

            <FormControl style={{ marginBottom: groups ? 6 : 18 }}>
              <InputLabel>{Messages.motions.form.motionType()}</InputLabel>
              <Dropdown value={action} onChange={handleActionChange}>
                {ActionTypeOptions.map((option) => (
                  <MenuItem value={option.value} key={option.value}>
                    {option.message}
                  </MenuItem>
                ))}
              </Dropdown>
            </FormControl>

            {groups && (
              <FormControl style={{ marginBottom: 18 }}>
                <InputLabel>{Messages.motions.form.group()}</InputLabel>
                <Dropdown value={selectedGroupId} onChange={handleGroupChange}>
                  {groups.map((group) => (
                    <MenuItem value={group.id} key={group.id}>
                      {truncate(group.name, { length: 65 })}
                    </MenuItem>
                  ))}
                </Dropdown>
              </FormControl>
            )}

            <ActionFields actionType={action} setActionData={setActionData} />

            {action !== ActionTypes.ChangeImage && (
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

          <Divider style={{ marginBottom: 24 }} />

          <div className={styles.flexEnd}>
            <SubmitButton disabled={isSubmitButtonDisabled(formik)}>
              {isEditing
                ? Messages.actions.save()
                : Messages.motions.actions.motion()}
            </SubmitButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default MotionsForm;
