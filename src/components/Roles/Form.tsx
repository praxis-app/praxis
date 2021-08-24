import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { FormGroup } from "@material-ui/core";
import { Formik, FormikHelpers, Form, Field } from "formik";

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
  role?: Role;
  roles?: Role[];
  setRole?: (role: Role) => void;
  setRoles?: (roles: Role[]) => void;
  isEditing?: boolean;
}

const RoleForm = ({ role, roles, setRole, setRoles, isEditing }: Props) => {
  const currentUser = useCurrentUser();
  const [color, setColor] = useState<string>(DEFAULT_ROLE_COLOR);
  const [colorPickerKey, setColorPickerKey] = useState<string>("");
  const [createRole] = useMutation(CREATE_ROLE);
  const [updateRole] = useMutation(UPDATE_ROLE);
  const router = useRouter();

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

  if (currentUser)
    return (
      <Formik
        initialValues={{ name: isEditing && role ? role.name : "" }}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className={styles.form}>
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

            <SubmitButton disabled={formik.isSubmitting}>
              {isEditing ? Messages.actions.save() : Messages.actions.create()}
            </SubmitButton>
          </Form>
        )}
      </Formik>
    );
  return null;
};

export default RoleForm;
