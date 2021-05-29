import React, { useState, useEffect, ChangeEvent } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Router from "next/router";
import { FormGroup, Input, Button } from "@material-ui/core";
import { Image, RemoveCircle } from "@material-ui/icons";

import {
  SIGN_UP,
  UPDATE_USER,
  SET_CURRENT_USER,
} from "../../apollo/client/mutations";
import { CURRENT_USER } from "../../apollo/client/queries";
import { setAuthToken } from "../../utils/auth";

import styles from "../../styles/User/UserForm.module.scss";
import Messages from "../../utils/messages";
import { Common } from "../../constants";

interface Props {
  user?: User;
  isEditing?: boolean;
}

const UserForm = ({ user, isEditing }: Props) => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState<File>();
  const [userPassword, setUserPassword] = useState("");
  const [userPasswordConfirm, setUserPasswordConfirm] = useState("");
  const [imageInputKey, setImageInputKey] = useState<string>("");
  const imageInput = React.useRef<HTMLInputElement>(null);

  const [signUp] = useMutation(SIGN_UP);
  const [updateUser] = useMutation(UPDATE_USER);
  const [setCurrentUser] = useMutation(SET_CURRENT_USER);
  const currentUserRes = useQuery(CURRENT_USER);

  useEffect(() => {
    if (isEditing && user) {
      setUserName(user.name);
      setUserEmail(user.email);
    }
  }, [user, isEditing]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (isEditing && user) {
      try {
        if (currentUserRes.data) {
          const { data } = await updateUser({
            variables: {
              id: user.id,
              name: userName,
              email: userEmail,
              profilePicture,
            },
          });

          if (currentUserRes.data.user.id === user.id) {
            localStorage.setItem(
              Common.LocalStorage.JwtToken,
              data.updateUser.token
            );
            setAuthToken(data.updateUser.token);

            const { id, name, email } = data.updateUser.user;
            await setCurrentUser({
              variables: {
                id,
                name,
                email,
              },
            });
          }

          Router.push(`/users/${data.updateUser.user.name}`);
        }
      } catch (err) {
        alert(err);
      }
    } else {
      try {
        const { data } = await signUp({
          variables: {
            name: userName,
            email: userEmail,
            password: userPassword,
            passwordConfirm: userPasswordConfirm,
            profilePicture,
          },
        });

        const { id, name, email } = data.signUp.user;
        await setCurrentUser({
          variables: {
            id,
            name,
            email,
          },
        });

        localStorage.setItem(Common.LocalStorage.JwtToken, data.signUp.token);
        setAuthToken(data.signUp.token);
        Router.push("/");
      } catch (err) {
        alert(err);
      }
    }
  };

  const removeSelectedProfilePicture = () => {
    setProfilePicture(undefined);
    setImageInputKey(Math.random().toString(2));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <FormGroup>
        <Input
          type="text"
          placeholder={Messages.users.form.name()}
          onChange={(e) => setUserName(e.target.value)}
          value={userName}
          style={{
            marginBottom: "12px",
            color: "rgb(170, 170, 170)",
          }}
        />
        <Input
          type="text"
          placeholder={Messages.users.form.email()}
          onChange={(e) => setUserEmail(e.target.value)}
          value={userEmail}
          style={{
            marginBottom: "12px",
            color: "rgb(170, 170, 170)",
          }}
        />

        <input
          type="file"
          accept="image/*"
          ref={imageInput}
          key={imageInputKey}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            e.target.files && setProfilePicture(e.target.files[0])
          }
          className={styles.imageInput}
        />
        <Image
          className={styles.imageInputIcon}
          onClick={() => imageInput.current?.click()}
          fontSize="large"
        />
      </FormGroup>

      {profilePicture && (
        <div className={styles.selectedImages}>
          <img
            alt={Messages.images.couldNotRender()}
            className={styles.selectedImage}
            src={URL.createObjectURL(profilePicture)}
          />

          <RemoveCircle
            style={{ color: "white" }}
            onClick={() => removeSelectedProfilePicture()}
            className={styles.removeSelectedImageButton}
          />
        </div>
      )}

      {!isEditing && (
        <>
          <FormGroup
            style={{
              marginBottom: "6px",
            }}
          >
            <Input
              type="password"
              placeholder={Messages.users.form.password()}
              onChange={(e) => setUserPassword(e.target.value)}
              value={userPassword}
              style={{
                marginBottom: "12px",
                color: "rgb(170, 170, 170)",
              }}
            />
            <Input
              type="password"
              placeholder={Messages.users.actions.passwordConfirm()}
              onChange={(e) => setUserPasswordConfirm(e.target.value)}
              value={userPasswordConfirm}
              style={{
                marginBottom: "12px",
                color: "rgb(170, 170, 170)",
              }}
            />
          </FormGroup>
        </>
      )}

      <Button
        variant="contained"
        type="submit"
        style={{ color: "white", backgroundColor: "rgb(65, 65, 65)" }}
      >
        {isEditing ? Messages.actions.save() : Messages.users.actions.signUp()}
      </Button>
    </form>
  );
};

export default UserForm;
