import React from "react";
import { useState, ChangeEvent, useEffect } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { FormGroup, Input, Button } from "@material-ui/core";
import Router from "next/router";
import { RemoveCircle, Image } from "@material-ui/icons";

import baseUrl from "../../utils/baseUrl";
import { CURRENT_USER, IMAGES_BY_POST_ID } from "../../apollo/client/queries";
import {
  CREATE_POST,
  UPDATE_POST,
  DELETE_IMAGE,
} from "../../apollo/client/mutations";
import styles from "../../styles/Post/PostForm.module.scss";

interface Props {
  post?: Post;
  posts?: Post[];
  isEditing?: boolean;
  setPosts?: (posts: Post[]) => void;
  group?: Group;
}

const PostsForm = ({ post, posts, isEditing, setPosts, group }: Props) => {
  const [imagesInputKey, setImagesInputKey] = useState<string>("");
  const [savedImages, setSavedImages] = useState([]);
  const [images, setImages] = useState<File[]>([]);
  const [body, setBody] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const imagesInput = React.useRef<HTMLInputElement>(null);

  const [createPost] = useMutation(CREATE_POST);
  const [updatePost] = useMutation(UPDATE_POST);
  const [deleteImage] = useMutation(DELETE_IMAGE);
  const currentUserRes = useQuery(CURRENT_USER);
  const [getSavedImagesRes, savedImagesRes] = useLazyQuery(IMAGES_BY_POST_ID, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (isEditing && post) {
      setBody(post.body);
    }
  }, [post, isEditing]);

  useEffect(() => {
    if (post) getSavedImagesRes({ variables: { postId: post.id } });
  }, []);

  useEffect(() => {
    setSavedImages(
      savedImagesRes.data ? savedImagesRes.data.imagesByPostId : []
    );
  }, [savedImagesRes.data]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (currentUserRes.data) {
      setSubmitLoading(true);
      if (isEditing && post) {
        try {
          setBody("");
          await updatePost({
            variables: {
              id: post.id,
              body: body,
              images: images,
            },
          });
          // Redirect to Show Post after update
          Router.push(`/posts/${post.id}`);
        } catch (err) {
          alert(err);
        }
      } else {
        try {
          setBody("");
          setImages([]);
          e.target.reset();
          const { data } = await createPost({
            variables: {
              body: body,
              images: images,
              groupId: group?.id,
              userId: currentUserRes.data.user.id,
            },
          });
          if (posts && setPosts) setPosts([...posts, data.createPost.post]);
        } catch (err) {
          alert(err);
        }
      }
      setSubmitLoading(false);
    }
  };

  const deleteImageHandler = async (id: string) => {
    try {
      await deleteImage({
        variables: {
          id,
        },
      });
      // Removes deleted image from state
      setSavedImages(savedImages.filter((image: Image) => image.id !== id));
    } catch {}
  };

  const removeSelectedImage = (imageName: string) => {
    setImages(
      [...images].filter((image) => {
        return image.name !== imageName;
      })
    );
    setImagesInputKey(Math.random().toString(2));
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
            submitLoading ? "Loading..." : "Post something awesome..."
          }
          value={body}
          multiline
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setBody(e.target.value)
          }
          style={{
            marginBottom: "12px",
            color: "rgb(170, 170, 170)",
          }}
        />

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
            <React.Fragment key={image.name}>
              <img
                alt="Data could not render."
                className={styles.selectedImage}
                src={URL.createObjectURL(image)}
              />

              <RemoveCircle
                style={{ color: "white" }}
                onClick={() => removeSelectedImage(image.name)}
                className={styles.removeSelectedImageButton}
              />
            </React.Fragment>
          );
        })}

        {savedImages.map(({ id, path }) => {
          return (
            <React.Fragment key={id}>
              <img
                alt="Data could not render."
                className={styles.selectedImage}
                src={baseUrl + path}
              />

              <RemoveCircle
                style={{ color: "white" }}
                onClick={() => deleteImageHandler(id)}
                className={styles.removeSelectedImageButton}
              />
            </React.Fragment>
          );
        })}
      </div>

      <Button
        variant="contained"
        type="submit"
        style={{ color: "white", backgroundColor: "rgb(65, 65, 65)" }}
      >
        {isEditing ? "Save" : "Post"}
      </Button>
    </form>
  );
};

export default PostsForm;
