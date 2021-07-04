import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { FormGroup, Input } from "@material-ui/core";

import { CREATE_ROLE, UPDATE_ROLE } from "../../apollo/client/mutations";
import styles from "../../styles/Group/GroupForm.module.scss";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import ColorPicker from "../Shared/ColorPicker";
import { Roles } from "../../constants";
import { generateRandom } from "../../utils/common";
import SubmitButton from "../Shared/SubmitButton";

interface Props {
  role?: Role;
  roles?: Role[];
  setRole?: (role: Role) => void;
  setRoles?: (roles: Role[]) => void;
  isEditing?: boolean;
}

const RoleForm = ({ role, roles, setRole, setRoles, isEditing }: Props) => {
  const currentUser = useCurrentUser();
  const [name, setName] = useState<string>("");
  const [color, setColor] = useState<string>(Roles.DEFAULT_COLOR);
  const [colorPickerKey, setColorPickerKey] = useState<string>("");
  const [createRole] = useMutation(CREATE_ROLE);
  const [updateRole] = useMutation(UPDATE_ROLE);
  const router = useRouter();

  useEffect(() => {
    if (isEditing && role) {
      setName(role.name);
      setColor(role.color);
    }
  }, [role, isEditing]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

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
          setName("");
          const { data } = await createRole({
            variables: {
              name,
              color,
              global: onGlobalRolesPage(),
            },
          });

          if (setRoles && roles) setRoles([...roles, data.createRole.role]);
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
      <form onSubmit={handleSubmit} className={styles.card}>
        <FormGroup>
          <Input
            type="text"
            placeholder={Messages.groups.form.name()}
            onChange={(e) => setName(e.target.value)}
            value={name}
            style={{
              marginBottom: "12px",
              color: "rgb(170, 170, 170)",
            }}
          />
          <ColorPicker
            color={color}
            onChange={handleChangeComplete}
            label={Messages.roles.colorPickerLabel()}
            key={colorPickerKey}
          />
        </FormGroup>

        <SubmitButton>
          {isEditing ? Messages.actions.save() : Messages.actions.create()}
        </SubmitButton>
      </form>
    );
  return <></>;
};

export default RoleForm;
