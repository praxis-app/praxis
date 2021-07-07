import React, { useState, useEffect, ChangeEvent } from "react";
import { useMutation } from "@apollo/client";
import Router from "next/router";
import { FormGroup } from "@material-ui/core";
import { Image, RemoveCircle } from "@material-ui/icons";

import {
  SIGN_UP,
  UPDATE_USER,
  SET_CURRENT_USER,
} from "../../apollo/client/mutations";
import { setAuthToken } from "../../utils/auth";
import styles from "../../styles/Shared/Shared.module.scss";
import Messages from "../../utils/messages";
import { Common } from "../../constants";
import { useCurrentUser } from "../../hooks";
import { generateRandom } from "../../utils/common";
import SubmitButton from "../Shared/SubmitButton";
import TextInput, { PasswordInput } from "../Shared/TextInput";

interface Props {
  user?: User;
  isEditing?: boolean;
}

const UserForm = ({ user, isEditing }: Props) => {
  const currentUser = useCurrentUser();
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<File>();
  const [userPassword, setUserPassword] = useState<string>("");
  const [userPasswordConfirm, setUserPasswordConfirm] = useState<string>("");
  const [imageInputKey, setImageInputKey] = useState<string>("");
  const imageInput = React.useRef<HTMLInputElement>(null);

  const [signUp] = useMutation(SIGN_UP);
  const [updateUser] = useMutation(UPDATE_USER);
  const [setCurrentUser] = useMutation(SET_CURRENT_USER);

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
        if (currentUser) {
          const { data } = await updateUser({
            variables: {
              id: user.id,
              name: userName,
              email: userEmail,
              profilePicture,
            },
          });

          if (currentUser.id === user.id) {
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
    setImageInputKey(generateRandom());
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <FormGroup>
        <TextInput
          placeholder={Messages.users.form.name()}
          onChange={(e) => setUserName(e.target.value)}
          value={userName}
        />
        <TextInput
          placeholder={Messages.users.form.email()}
          onChange={(e) => setUserEmail(e.target.value)}
          value={userEmail}
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
            color="primary"
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
            <PasswordInput
              placeholder={Messages.users.form.password()}
              onChange={(e) => setUserPassword(e.target.value)}
              value={userPassword}
            />
            <PasswordInput
              placeholder={Messages.users.actions.passwordConfirm()}
              onChange={(e) => setUserPasswordConfirm(e.target.value)}
              value={userPasswordConfirm}
            />
          </FormGroup>
        </>
      )}

      <SubmitButton>
        {isEditing ? Messages.actions.save() : Messages.users.actions.signUp()}
      </SubmitButton>
    </form>
  );
};

export default UserForm;
