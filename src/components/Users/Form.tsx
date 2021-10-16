import { useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import Router from "next/router";
import {
  Card,
  CardContent,
  CardActions as MUICardActions,
  createStyles,
  FormGroup,
  withStyles,
  Divider,
  Typography,
} from "@material-ui/core";
import { RemoveCircle } from "@material-ui/icons";
import { Formik, Form, Field } from "formik";

import {
  SIGN_UP,
  UPDATE_USER,
  SET_CURRENT_USER,
} from "../../apollo/client/mutations";
import styles from "../../styles/User/User.module.scss";
import {
  LocalStorage,
  NavigationPaths,
  ResourcePaths,
} from "../../constants/common";
import { useCurrentUser } from "../../hooks";
import SubmitButton from "../Shared/SubmitButton";
import TextField, { PasswordField } from "../Shared/TextField";
import ImageInput from "../Images/Input";
import { FieldNames } from "../../constants/user";
import Messages from "../../utils/messages";
import {
  errorToast,
  generateRandom,
  noCache,
  setAuthToken,
} from "../../utils/clientIndex";
import UserAvatar from "./Avatar";
import { COVER_PHOTO_BY_USER_ID } from "../../apollo/client/queries";
import CoverPhoto from "../Images/CoverPhoto";
import CompactButton from "../Shared/CompactButton";

const CardActions = withStyles(() =>
  createStyles({
    root: {
      justifyContent: "space-between",
      padding: 0,
    },
  })
)(MUICardActions);

interface FormValues {
  bio: string;
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
  const [coverPhoto, setCoverPhoto] = useState<File>();
  const [profilePicture, setProfilePicture] = useState<File>();
  const [imageInputKey, setImageInputKey] = useState<string>("");
  const [currentCoverPhoto, setCurrentCoverPhoto] = useState<ClientImage>();
  const [getCurrentCoverPhotoRes, currentCoverPhotoRes] = useLazyQuery(
    COVER_PHOTO_BY_USER_ID,
    noCache
  );
  const [signUp] = useMutation(SIGN_UP);
  const [updateUser] = useMutation(UPDATE_USER);
  const [setCurrentUser] = useMutation(SET_CURRENT_USER);
  const initialValues = {
    name: isEditing && user ? user.name : "",
    email: isEditing && user ? user.email : "",
    bio: isEditing && user?.bio ? user.bio : "",
    password: "",
    passwordConfirm: "",
  };

  useEffect(() => {
    if (user && isEditing)
      getCurrentCoverPhotoRes({
        variables: { userId: user.id },
        ...noCache,
      });
  }, [user, isEditing]);

  useEffect(() => {
    if (currentCoverPhotoRes.data)
      setCurrentCoverPhoto(currentCoverPhotoRes.data.coverPhotoByUserId);
  }, [currentCoverPhotoRes.data]);

  const handleSubmit = async ({
    bio,
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
              bio,
              name,
              email,
              profilePicture,
              coverPhoto,
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
          Router.push(`${ResourcePaths.User}${data.updateUser.user.name}`);
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
      errorToast(err);
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
              {isEditing && (
                <>
                  <div className={styles.flexBetween}>
                    <Typography color="primary">
                      {Messages.users.form.profilePicture()}
                    </Typography>

                    <ImageInput setImage={setProfilePicture}>
                      <CompactButton>{Messages.actions.edit()}</CompactButton>
                    </ImageInput>
                  </div>

                  <UserAvatar
                    user={user}
                    withoutLink
                    image={profilePicture}
                    style={{
                      width: 140,
                      height: 140,
                      margin: "0 auto",
                      marginBottom: 24,
                    }}
                  />

                  <Divider style={{ marginBottom: 12 }} />

                  <div className={styles.flexBetween}>
                    <Typography color="primary">
                      {Messages.users.form.coverPhoto()}
                    </Typography>

                    <ImageInput setImage={setCoverPhoto}>
                      <CompactButton>{Messages.actions.edit()}</CompactButton>
                    </ImageInput>
                  </div>

                  {currentCoverPhoto || coverPhoto ? (
                    <CoverPhoto
                      path={currentCoverPhoto?.path}
                      image={coverPhoto}
                      rounded
                    />
                  ) : (
                    <Typography>
                      {Messages.users.form.setCoverPhoto()}
                    </Typography>
                  )}

                  <Divider style={{ marginTop: 24, marginBottom: 12 }} />

                  <Field
                    name={FieldNames.Bio}
                    placeholder={Messages.users.form.describeYourself()}
                    label={Messages.users.form.bio()}
                    component={TextField}
                    autoComplete="off"
                    multiline
                  />
                </>
              )}

              <FormGroup>
                <Field
                  name={FieldNames.Name}
                  label={Messages.users.form.name()}
                  component={TextField}
                  autoComplete="off"
                />
                <Field
                  name={FieldNames.Email}
                  label={Messages.users.form.email()}
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
                      label={Messages.users.form.password()}
                      component={PasswordField}
                    />
                    <Field
                      name={FieldNames.PasswordConfirm}
                      label={Messages.users.actions.passwordConfirm()}
                      component={PasswordField}
                    />
                  </FormGroup>
                </>
              )}

              {profilePicture && !isEditing && (
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
                  {!isEditing && (
                    <ImageInput
                      setImage={setProfilePicture}
                      refreshKey={imageInputKey}
                    />
                  )}
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
