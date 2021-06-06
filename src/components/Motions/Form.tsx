import { useState, ChangeEvent, useEffect, useRef, Fragment } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  FormGroup,
  Input,
  Button,
  NativeSelect,
  FormControl,
  InputLabel,
  makeStyles,
} from "@material-ui/core";
import Router from "next/router";
import { RemoveCircle, Image } from "@material-ui/icons";

import Messages from "../../utils/messages";
import baseUrl from "../../utils/baseUrl";
import { IMAGES_BY_MOTION_ID } from "../../apollo/client/queries";
import {
  CREATE_MOTION,
  UPDATE_MOTION,
  DELETE_IMAGE,
} from "../../apollo/client/mutations";
import { Motions } from "../../constants";
import ActionFields from "./ActionFields";
import styles from "../../styles/Motion/MotionForm.module.scss";
import { useCurrentUser } from "../../hooks";
import { randomKey } from "../../utils/common";

const color = { color: "rgb(170, 170, 170)" };
const useStyles = makeStyles(() => ({
  select: { ...color },
  textInput: { ...color },
}));

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
  const [body, setBody] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [actionData, setActionData] = useState<ActionData>({});
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const imagesInput = useRef<HTMLInputElement>(null);

  const [createMotion] = useMutation(CREATE_MOTION);
  const [updateMotion] = useMutation(UPDATE_MOTION);
  const [deleteImage] = useMutation(DELETE_IMAGE);
  const [getSavedImagesRes, savedImagesRes] = useLazyQuery(
    IMAGES_BY_MOTION_ID,
    {
      fetchPolicy: "no-cache",
    }
  );
  const classes = useStyles();

  useEffect(() => {
    if (isEditing && motion) {
      setBody(motion.body);
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (currentUser) {
      setSubmitLoading(true);
      if (isEditing && motion) {
        try {
          setBody("");
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
        } catch (err) {
          alert(err);
        }
      } else {
        try {
          setBody("");
          setAction("");
          setImages([]);
          e.target.reset();
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
          if (motions && setMotions)
            setMotions([...motions, data.createMotion.motion]);
        } catch (err) {
          alert(err);
        }
      }
      setSubmitLoading(false);
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
    setImagesInputKey(randomKey());
  };

  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      className={styles.form}
      style={group && { marginTop: "48px" }}
    >
      <FormGroup>
        <Input
          type="text"
          placeholder={
            submitLoading
              ? Messages.states.loading()
              : Messages.motions.form.makeAMotion()
          }
          value={body}
          multiline
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setBody(e.target.value)
          }
          style={{
            marginBottom: "6px",
          }}
          classes={{
            input: classes.textInput,
          }}
        />

        <FormControl style={{ marginBottom: "20px" }}>
          <InputLabel
            style={{ color: "rgb(105, 105, 105)", fontFamily: "Inter" }}
          >
            {Messages.motions.form.motionType()}
          </InputLabel>
          <NativeSelect
            value={action}
            onChange={handleActionChange}
            classes={{
              select: classes.select,
            }}
          >
            <option aria-label="None" value="" />
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

        <input
          multiple
          type="file"
          accept="image/*"
          key={imagesInputKey}
          ref={imagesInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            e.target.files && setImages([...e.target.files])
          }
          className={styles.imageInput}
        />
        <Image
          className={styles.imageInputIcon}
          onClick={() => imagesInput.current?.click()}
          fontSize="large"
        />
      </FormGroup>

      <div className={styles.selectedImages}>
        {[...images].map((image) => {
          return (
            <Fragment key={image.name}>
              <img
                alt={Messages.images.couldNotRender()}
                className={styles.selectedImage}
                src={URL.createObjectURL(image)}
              />

              <RemoveCircle
                style={{ color: "white" }}
                onClick={() => removeSelectedImage(image.name)}
                className={styles.removeSelectedImageButton}
              />
            </Fragment>
          );
        })}

        {savedImages.map(({ id, path }) => {
          return (
            <Fragment key={id}>
              <img
                alt={Messages.images.couldNotRender()}
                className={styles.selectedImage}
                src={baseUrl + path}
              />

              <RemoveCircle
                style={{ color: "white" }}
                onClick={() => deleteImageHandler(id)}
                className={styles.removeSelectedImageButton}
              />
            </Fragment>
          );
        })}
      </div>

      <Button
        variant="contained"
        type="submit"
        style={{ color: "white", backgroundColor: "rgb(65, 65, 65)" }}
      >
        {isEditing
          ? Messages.actions.save()
          : Messages.motions.actions.motion()}
      </Button>
    </form>
  );
};

export default MotionsForm;
