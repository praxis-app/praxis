import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
} from "@material-ui/core";

import { CREATE_SERVER_INVITE } from "../../apollo/client/mutations";
import styles from "../../styles/ServerInvite/ServerInvite.module.scss";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import { Time } from "../../constants/common";
import { MAX_USES_OPTIONS } from "../../constants/serverInvite";
import SubmitButton from "../Shared/SubmitButton";
import Dropdown from "../Shared/Dropdown";

interface Props {
  invites: ServerInvite[];
  setInvites: (roles: ServerInvite[]) => void;
}

const ServerInviteForm = ({ invites, setInvites }: Props) => {
  const currentUser = useCurrentUser();
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [maxUses, setMaxUses] = useState<string>("");
  const [createServerInvite] = useMutation(CREATE_SERVER_INVITE);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (currentUser) {
      try {
        setExpiresAt("");
        setMaxUses("");
        const userId = currentUser.id;
        const { data } = await createServerInvite({
          variables: {
            maxUses: parseInt(maxUses),
            expiresAt,
            userId,
          },
        });

        if (setInvites && invites)
          setInvites([...invites, data.createServerInvite.serverInvite]);
      } catch (err) {
        alert(err);
      }
    }
  };

  const handleExpiresAtChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setExpiresAt((event.target.value as number).toString());
  };

  const handleMaxUsesChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setMaxUses(event.target.value as string);
  };

  if (currentUser)
    return (
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormGroup style={{ marginBottom: "12px" }}>
          <FormControl>
            <InputLabel>{Messages.invites.form.labels.expiresAt()}</InputLabel>
            <Dropdown value={expiresAt} onChange={handleExpiresAtChange}>
              <MenuItem value={Time.Day}>
                {Messages.invites.form.expiresAtOptions.oneDay()}
              </MenuItem>
              <MenuItem value={Time.Week}>
                {Messages.invites.form.expiresAtOptions.sevenDays()}
              </MenuItem>
              <MenuItem value={Time.Month}>
                {Messages.invites.form.expiresAtOptions.oneMonth()}
              </MenuItem>
              <MenuItem value={""}>
                {Messages.invites.form.expiresAtOptions.never()}
              </MenuItem>
            </Dropdown>
          </FormControl>

          <FormControl>
            <InputLabel>{Messages.invites.form.labels.maxUses()}</InputLabel>
            <Dropdown value={maxUses} onChange={handleMaxUsesChange}>
              {MAX_USES_OPTIONS.map((option: number) => {
                return (
                  <MenuItem value={option} key={option}>
                    {Messages.invites.form.maxUsesOptions.xUses(option)}
                  </MenuItem>
                );
              })}
              <MenuItem value={""}>
                {Messages.invites.form.maxUsesOptions.noLimit()}
              </MenuItem>
            </Dropdown>
          </FormControl>
        </FormGroup>

        <SubmitButton>{Messages.actions.create()}</SubmitButton>
      </form>
    );
  return null;
};

export default ServerInviteForm;
