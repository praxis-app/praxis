import { useState } from "react";
import { useMutation } from "@apollo/client";
import Router from "next/router";
import {
  createStyles,
  withStyles,
  FormGroup,
  Divider,
  Card,
  CardContent,
  CardActions as MUICardActions,
} from "@material-ui/core";
import { RemoveCircle } from "@material-ui/icons";
import { Formik, Form, Field, FormikProps } from "formik";

import { CREATE_GROUP, UPDATE_GROUP } from "../../apollo/client/mutations";
import styles from "../../styles/Group/Form.module.scss";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import { generateRandom } from "../../utils/common";
import SubmitButton from "../Shared/SubmitButton";
import TextField from "../Shared/TextField";
import { FieldNames, ResourcePaths } from "../../constants/common";
import ImageInput from "../Images/Input";
import { errorToast } from "../../utils/apollo";

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
  description: string;
}

interface Props {
  group?: ClientGroup;
  isEditing?: boolean;
}

const GroupForm = ({ group, isEditing }: Props) => {
  const currentUser = useCurrentUser();
  const [coverPhoto, setCoverPhoto] = useState<File>();
  const [imageInputKey, setImageInputKey] = useState<string>("");

  const [createGroup] = useMutation(CREATE_GROUP);
  const [updateGroup] = useMutation(UPDATE_GROUP);

  const initialValues = {
    name: isEditing && group ? group.name : "",
    description: isEditing && group ? group.description : "",
  };

  const handleSubmit = async ({ name, description }: FormValues) => {
    if (currentUser) {
      try {
        if (isEditing && group) {
          const { data } = await updateGroup({
            variables: {
              id: group.id,
              name,
              description,
              coverPhoto,
            },
          });

          Router.push(`${ResourcePaths.Group}${data.updateGroup.group.name}`);
        } else {
          const { data } = await createGroup({
            variables: {
              name,
              description,
              coverPhoto,
              creatorId: currentUser.id,
            },
          });

          Router.push(`${ResourcePaths.Group}${data.createGroup.group.name}`);
        }
      } catch (err) {
        errorToast(err);
      }
    }
  };

  const removeSelectedCoverPhoto = () => {
    setCoverPhoto(undefined);
    setImageInputKey(generateRandom());
  };

  const isSubmitButtonDisabled = ({
    values: { name },
    isSubmitting,
    dirty,
  }: FormikProps<FormValues>): boolean => {
    if (!name) return true;
    if (isSubmitting) return true;
    if (isEditing && coverPhoto) return false;
    return !dirty;
  };

  if (currentUser)
    return (
      <Card>
        <CardContent>
          <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            {(formik) => (
              <Form>
                <FormGroup>
                  <Field
                    name={FieldNames.Name}
                    label={Messages.groups.form.name()}
                    component={TextField}
                    autoComplete="off"
                  />

                  <Field
                    name={FieldNames.Description}
                    label={Messages.groups.form.description()}
                    component={TextField}
                    multiline
                  />
                </FormGroup>

                {coverPhoto && (
                  <>
                    <div className={styles.selectedImages}>
                      <img
                        alt={Messages.images.couldNotRender()}
                        className={styles.selectedImage}
                        src={URL.createObjectURL(coverPhoto)}
                      />

                      <RemoveCircle
                        color="primary"
                        onClick={() => removeSelectedCoverPhoto()}
                        className={styles.removeSelectedImageButton}
                      />
                    </div>

                    <Divider style={{ marginBottom: 12, marginTop: 18 }} />
                  </>
                )}

                <CardActions>
                  <div style={{ display: "flex", marginTop: -12 }}>
                    <ImageInput
                      setImage={setCoverPhoto}
                      refreshKey={imageInputKey}
                    />
                  </div>

                  <SubmitButton
                    disabled={isSubmitButtonDisabled(formik)}
                    style={{ marginTop: 4 }}
                  >
                    {isEditing
                      ? Messages.actions.save()
                      : Messages.actions.create()}
                  </SubmitButton>
                </CardActions>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    );
  return null;
};

export default GroupForm;
