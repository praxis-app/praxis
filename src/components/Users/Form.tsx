import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import Router from "next/router";
import {
  Card,
  CardContent,
  CardActions as MUICardActions,
  createStyles,
  FormGroup,
  withStyles,
  Divider,
} from "@material-ui/core";
import { RemoveCircle } from "@material-ui/icons";
import { Formik, Form, Field } from "formik";

import {
  SIGN_UP,
  UPDATE_USER,
  SET_CURRENT_USER,
} from "../../apollo/client/mutations";
import { setAuthToken } from "../../utils/auth";
import styles from "../../styles/User/User.module.scss";
import Messages from "../../utils/messages";
import {
  LocalStorage,
  NavigationPaths,
  ToastStatus,
} from "../../constants/common";
import { useCurrentUser } from "../../hooks";
import { generateRandom } from "../../utils/common";
import SubmitButton from "../Shared/SubmitButton";
import TextField, { PasswordField } from "../Shared/TextField";
import ImageInput from "../Images/Input";
import { toastVar } from "../../apollo/client/localState";
import { FieldNames } from "../../constants/user";

const CardActions = withStyles(() =>
  createStyles({
    root: {
      justifyContent: "space-between",
      padding: 0,
    },
  })
)(MUICardActions);

interface FormValues {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

interface Props {
  user?: ClientUser;
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
        Router.push(NavigationPaths.Home);
      }
    } catch (err) {
      toastVar({
        title: Messages.errors.imageUploadError(),
        status: ToastStatus.Error,
      });
    }
  };

  const removeSelectedProfilePicture = () => {
    setProfilePicture(undefined);
    setImageInputKey(generateRandom());
  };

  return (
    <Card>
      <CardContent>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {(formik) => (
            <Form>
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
              </FormGroup>

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

              {profilePicture && (
                <>
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

                  <Divider style={{ marginBottom: 12, marginTop: 18 }} />
                </>
              )}

              <CardActions>
                <div style={{ marginTop: -12 }}>
                  <ImageInput
                    setImage={setProfilePicture}
                    refreshKey={imageInputKey}
                  />
                </div>

                <SubmitButton
                  disabled={formik.isSubmitting}
                  style={{ marginTop: 4 }}
                >
                  {isEditing
                    ? Messages.actions.save()
                    : Messages.users.actions.signUp()}
                </SubmitButton>
              </CardActions>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default UserForm;
