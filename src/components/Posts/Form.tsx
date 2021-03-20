import { useState, ChangeEvent, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { FormGroup, Input, Button } from "@material-ui/core";
import Router from "next/router";

import { CURRENT_USER } from "../../apollo/client/queries";
import { CREATE_POST, UPDATE_POST } from "../../apollo/client/mutations";

interface Props {
  post?: Post;
  posts?: [Post];
  isEditing?: boolean;
  setPosts?: (posts: any) => void;
}

const PostsForm = ({ post, posts, isEditing, setPosts }: Props) => {
  const [images, setImages] = useState<FileList>(null);
  const [body, setBody] = useState<string>("");
  const [createPost] = useMutation(CREATE_POST);
  const [updatePost] = useMutation(UPDATE_POST);
  const currentUserRes = useQuery(CURRENT_USER);

  useEffect(() => {
    if (isEditing) {
      setBody(post.body);
    }
  }, [post, isEditing]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (currentUserRes.data) {
      if (isEditing) {
        try {
          await updatePost({
            variables: {
              id: post.id,
              body: body,
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
          e.target.reset();
          setPosts([...posts, data.createPost.post]);
        } catch (err) {
          alert(err);
        }
      }
    }
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
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setImages(e.target.files)
          }
          style={{ fontSize: "10px", marginBottom: "12px" }}
        />
      </FormGroup>

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
