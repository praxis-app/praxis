import React from "react";
import { useState, ChangeEvent, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { FormGroup, Input, Button } from "@material-ui/core";
import Router from "next/router";
import { RemoveCircle } from "@material-ui/icons";

import baseUrl from "../../utils/baseUrl";
import { CURRENT_USER, IMAGES_BY_POST_ID } from "../../apollo/client/queries";
import {
  CREATE_POST,
  UPDATE_POST,
  DELETE_IMAGE,
} from "../../apollo/client/mutations";
import styles from "../../styles/PostsForm.module.scss";

interface Props {
  post?: Post;
  posts?: [Post];
  isEditing?: boolean;
  setPosts?: (posts: any) => void;
}

const PostsForm = ({ post, posts, isEditing, setPosts }: Props) => {
  const [imagesInputKey, setImagesInputKey] = useState<string>("");
  const [savedImages, setSavedImages] = useState([]);
  const [images, setImages] = useState<File[]>([]);
  const [body, setBody] = useState<string>("");

  const [createPost] = useMutation(CREATE_POST);
  const [updatePost] = useMutation(UPDATE_POST);
  const [deleteImage] = useMutation(DELETE_IMAGE);
  const currentUserRes = useQuery(CURRENT_USER);
  const savedImagesRes = useQuery(IMAGES_BY_POST_ID, {
    variables: { postId: post ? post.id : 0 },
  });

  useEffect(() => {
    if (isEditing) {
      setBody(post.body);
    }
  }, [post, isEditing]);

  useEffect(() => {
    setSavedImages(
      savedImagesRes.data ? savedImagesRes.data.imagesByPostId : []
    );
  }, [savedImagesRes.data]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (currentUserRes.data) {
      if (isEditing) {
        try {
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
          const { data } = await createPost({
            variables: {
              body: body,
              images: images,
              userId: currentUserRes.data.user.id,
            },
          });
          setBody("");
          setImages([]);
          e.target.reset();
          setPosts([...posts, data.createPost.post]);
        } catch (err) {
          alert(err);
        }
      }
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
      setSavedImages(savedImages.filter((image) => image.id !== id));
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
      style={{ marginBottom: "12px", width: "420px" }}
    >
      <FormGroup>
        <Input
          type="text"
          placeholder="Post something awesome..."
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
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setImages([...e.target.files])
          }
          style={{ fontSize: "10px", marginBottom: "12px" }}
        />
      </FormGroup>

      <div className={styles.selectedImages}>
        {[...images].map((image) => {
          return (
            <React.Fragment key={image.name}>
              <img
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
              <img className={styles.selectedImage} src={baseUrl + path} />

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
