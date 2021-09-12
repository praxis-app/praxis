import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { Card, CardContent, FormGroup } from "@material-ui/core";
import { Formik, FormikHelpers, Form, Field, FormikProps } from "formik";

import { CREATE_ROLE, UPDATE_ROLE } from "../../apollo/client/mutations";
import styles from "../../styles/Shared/Shared.module.scss";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import ColorPicker from "../Shared/ColorPicker";
import { FieldNames } from "../../constants/common";
import { DEFAULT_ROLE_COLOR } from "../../constants/role";
import { generateRandom } from "../../utils/common";
import SubmitButton from "../Shared/SubmitButton";
import TextField from "../Shared/TextField";

interface FormValues {
  name: string;
}

interface Props {
  role?: ClientRole;
  roles?: ClientRole[];
  setRole?: (role: ClientRole) => void;
  setRoles?: (roles: ClientRole[]) => void;
  isEditing?: boolean;
}

const RoleForm = ({ role, roles, setRole, setRoles, isEditing }: Props) => {
  const currentUser = useCurrentUser();
  const [color, setColor] = useState<string>(DEFAULT_ROLE_COLOR);
  const [colorPickerKey, setColorPickerKey] = useState<string>("");
  const [createRole] = useMutation(CREATE_ROLE);
  const [updateRole] = useMutation(UPDATE_ROLE);
  const router = useRouter();

  const initialValues: FormValues = {
    name: isEditing && role ? role.name : "",
  };

  useEffect(() => {
    if (isEditing && role) {
      setColor(role.color);
    }
  }, [role, isEditing]);

  const handleSubmit = async (
    { name }: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    if (currentUser) {
      try {
        setColorPickerKey(generateRandom());
        if (isEditing && role) {
          const { data } = await updateRole({
            variables: {
              name,
              color,
              id: role.id,
            },
          });

          if (setRole) setRole(data.updateRole.role);
        } else {
          const { data } = await createRole({
            variables: {
              name,
              color,
              global: onGlobalRolesPage(),
            },
          });

          if (setRoles && roles) setRoles([...roles, data.createRole.role]);
          setSubmitting(false);
          resetForm();
        }
      } catch (err) {
        alert(err);
      }
    }
  };

  const handleChangeComplete = (color: any) => {
    setColor(color.hex);
  };

  const onGlobalRolesPage = (): boolean => {
    return router.asPath === "/roles";
  };

  const isSubmitButtonDisabled = ({
    isSubmitting,
    dirty,
  }: FormikProps<FormValues>): boolean => {
    if (anyUnsavedColor()) return false;
    if (!dirty) return true;
    return isSubmitting;
  };

  const anyUnsavedColor = (): boolean => {
    if (!role || !isEditing) return false;
    return role.color !== color;
  };

  if (currentUser)
    return (
      <Card>
        <CardContent>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {(formik) => (
              <Form>
                <FormGroup>
                  <Field
                    name={FieldNames.Name}
                    placeholder={Messages.roles.form.name()}
                    component={TextField}
                    autoComplete="off"
                  />
                  <ColorPicker
                    color={color}
                    onChange={handleChangeComplete}
                    label={Messages.roles.form.colorPickerLabel()}
                    key={colorPickerKey}
                  />
                </FormGroup>

                <div className={styles.flexEnd}>
                  <SubmitButton disabled={isSubmitButtonDisabled(formik)}>
                    {isEditing
                      ? Messages.actions.save()
                      : Messages.actions.create()}
                  </SubmitButton>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    );
  return null;
};

export default RoleForm;
