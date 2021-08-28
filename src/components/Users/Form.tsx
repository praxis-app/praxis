import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import Router from "next/router";
import { FormGroup } from "@material-ui/core";
import { RemoveCircle } from "@material-ui/icons";
import { Formik, Form, Field } from "formik";

import {
  SIGN_UP,
  UPDATE_USER,
  SET_CURRENT_USER,
} from "../../apollo/client/mutations";
import { setAuthToken } from "../../utils/auth";
import styles from "../../styles/Shared/Shared.module.scss";
import Messages from "../../utils/messages";
import { LocalStorage, ToastStatus } from "../../constants/common";
import { useCurrentUser } from "../../hooks";
import { generateRandom } from "../../utils/common";
import SubmitButton from "../Shared/SubmitButton";
import TextField, { PasswordField } from "../Shared/TextField";
import ImageInput from "../Shared/ImageInput";
import { toastVar } from "../../apollo/client/localState";
import { FieldNames } from "../../constants/user";

interface FormValues {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

interface Props {
  user?: User;
  isEditing?: boolean;
}

const UserForm = ({ user, isEditing }: Props) => {
  const currentUser = useCurrentUser();
  const [profilePicture, setProfilePicture] = useState<File>();
  const [imageInputKey, setImageInputKey] = useState<string>("");
  const initialValues = {
    name: isEditing && user ? user.name : "",
    email: isEditing && user ? user.email : "",
    password: "",
    passwordConfirm: "",
  };
  const [signUp] = useMutation(SIGN_UP);
  const [updateUser] = useMutation(UPDATE_USER);
  const [setCurrentUser] = useMutation(SET_CURRENT_USER);

  const handleSubmit = async ({
    name,
    email,
    password,
    passwordConfirm,
  }: FormValues) => {
    try {
      if (isEditing && user) {
        if (currentUser) {
          const { data } = await updateUser({
            variables: {
              id: user.id,
              name,
              email,
              profilePicture,
            },
          });

          if (currentUser.id === user.id) {
            localStorage.setItem(LocalStorage.JwtToken, data.updateUser.token);
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
      } else {
        const { data } = await signUp({
          variables: {
            name,
            email,
            password,
            passwordConfirm,
            profilePicture,
          },
        });

        await setCurrentUser({
          variables: {
            name,
            email,
            id: data.signUp.user.id,
          },
        });

        localStorage.setItem(LocalStorage.JwtToken, data.signUp.token);
        setAuthToken(data.signUp.token);
        Router.push("/");
      }
    } catch (err) {
      toastVar({
        title: err.toString(),
        status: ToastStatus.Error,
      });
    }
  };

  const removeSelectedProfilePicture = () => {
    setProfilePicture(undefined);
    setImageInputKey(generateRandom());
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {(formik) => (
        <Form className={styles.form}>
          <FormGroup>
            <Field
              name={FieldNames.Name}
              placeholder={Messages.users.form.name()}
              component={TextField}
              multiline
            />
            <Field
              name={FieldNames.Email}
              placeholder={Messages.users.form.email()}
              component={TextField}
            />

            <ImageInput
              setImage={setProfilePicture}
              refreshKey={imageInputKey}
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
                <Field
                  name={FieldNames.Password}
                  placeholder={Messages.users.form.password()}
                  component={PasswordField}
                />
                <Field
                  name={FieldNames.PasswordConfirm}
                  placeholder={Messages.users.actions.passwordConfirm()}
                  component={PasswordField}
                />
              </FormGroup>
            </>
          )}

          <SubmitButton disabled={formik.isSubmitting}>
            {isEditing
              ? Messages.actions.save()
              : Messages.users.actions.signUp()}
          </SubmitButton>
        </Form>
      )}
    </Formik>
  );
};

export default UserForm;
