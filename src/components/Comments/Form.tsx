import { useState, useEffect } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { FormGroup } from "@material-ui/core";
import Router from "next/router";
import { Formik, FormikHelpers, Form, Field, FormikProps } from "formik";

import { IMAGES_BY_COMMENT_ID } from "../../apollo/client/queries";
import {
  CREATE_COMMENT,
  UPDATE_COMMENT,
  DELETE_IMAGE,
} from "../../apollo/client/mutations";
import styles from "../../styles/Comment/CommentsForm.module.scss";
import Messages from "../../utils/messages";
import { noCache } from "../../utils/apollo";
import { useCurrentUser } from "../../hooks";
import { generateRandom } from "../../utils/common";
import SubmitButton from "../Shared/SubmitButton";
import TextField from "../Shared/TextField";
import { FieldNames, ResourcePaths } from "../../constants/common";
import SelectedImages from "../Images/Selected";
import ImageInput from "../Images/Input";

interface FormValues {
  body: string;
}

interface Props {
  postId?: string;
  motionId?: string;
  comment?: ClientComment;
  comments?: ClientComment[];
  isEditing?: boolean;
  setComments?: (comments: any) => void;
}

const CommentsForm = ({
  postId,
  motionId,
  comment,
  comments,
  isEditing,
  setComments,
}: Props) => {
  const currentUser = useCurrentUser();
  const [imagesInputKey, setImagesInputKey] = useState<string>("");
  const [savedImages, setSavedImages] = useState<ClientImage[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const [createComment] = useMutation(CREATE_COMMENT);
  const [updateComment] = useMutation(UPDATE_COMMENT);
  const [deleteImage] = useMutation(DELETE_IMAGE);
  const [getSavedImagesRes, savedImagesRes] = useLazyQuery(
    IMAGES_BY_COMMENT_ID,
    noCache
  );

  useEffect(() => {
    if (comment) getSavedImagesRes({ variables: { commentId: comment.id } });
  }, []);

  useEffect(() => {
    setSavedImages(
      savedImagesRes.data ? savedImagesRes.data.imagesByCommentId : []
    );
  }, [savedImagesRes.data]);

  const handleSubmit = async (
    { body }: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    if (currentUser) {
      try {
        if (isEditing) {
          await updateComment({
            variables: {
              id: comment?.id,
              body,
              images,
            },
          });
          if (comment?.postId)
            Router.push(`${ResourcePaths.Post}${comment.postId}`);
          if (comment?.motionId)
            Router.push(`${ResourcePaths.Motion}${comment.motionId}`);
        } else {
          const commentedItemId = postId
            ? {
                postId,
              }
            : {
                motionId,
              };
          const { data } = await createComment({
            variables: {
              userId: currentUser?.id,
              body,
              images,
              ...commentedItemId,
            },
          });
          resetForm();
          setImages([]);
          setSubmitting(false);
          if (comments && setComments)
            setComments([...comments, data.createComment.comment]);
        }
      } catch (err) {
        alert(err);
      }
    }
  };

  const deleteImageHandler = async (id: string) => {
    await deleteImage({
      variables: {
        id,
      },
    });
    setSavedImages(savedImages.filter((image) => image.id !== id));
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
    isSubmitting,
    dirty,
  }: FormikProps<FormValues>): boolean => {
    if (!isEditing && !dirty && !images.length) return true;
    return isSubmitting;
  };

  return (
    <Formik
      initialValues={{
        body: isEditing && comment ? comment.body : "",
      }}
      onSubmit={handleSubmit}
    >
      {(formik) => (
        <Form className={!isEditing ? styles.form : ""}>
          <FormGroup>
            <Field
              name={FieldNames.Body}
              placeholder={
                formik.isSubmitting
                  ? Messages.states.loading()
                  : Messages.comments.form.leaveAComment()
              }
              component={TextField}
              multiline
            />

            <ImageInput
              setImages={setImages}
              refreshKey={imagesInputKey}
              multiple
            />
          </FormGroup>

          <SelectedImages
            selectedImages={images}
            savedImages={savedImages}
            removeSelectedImage={removeSelectedImage}
            deleteSavedImage={deleteImageHandler}
          />

          <div className={styles.flexEnd}>
            <SubmitButton disabled={isSubmitButtonDisabled(formik)}>
              {isEditing
                ? Messages.actions.save()
                : Messages.comments.actions.comment()}
            </SubmitButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CommentsForm;
