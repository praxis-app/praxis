import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  FormControl,
  FormGroup,
  InputLabel,
  NativeSelect,
} from "@material-ui/core";

import { CREATE_SERVER_INVITE } from "../../apollo/client/mutations";
import styles from "../../styles/ServerInvite/ServerInvite.module.scss";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import { Common } from "../../constants";
import { ServerInvites } from "../../constants";
import SubmitButton from "../Shared/SubmitButton";

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
    event: React.ChangeEvent<{ value: string }>
  ) => {
    setExpiresAt(event.target.value);
  };

  const handleMaxUsesChange = (event: React.ChangeEvent<{ value: string }>) => {
    setMaxUses(event.target.value);
  };

  if (currentUser)
    return (
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormGroup style={{ marginBottom: "12px" }}>
          <FormControl>
            <InputLabel>{Messages.invites.form.labels.expiresAt()}</InputLabel>
            <NativeSelect value={expiresAt} onChange={handleExpiresAtChange}>
              <option aria-label={Messages.forms.none()} value="" />
              <option value={Common.Time.Day}>
                {Messages.invites.form.expiresAtOptions.oneDay()}
              </option>
              <option value={Common.Time.Week}>
                {Messages.invites.form.expiresAtOptions.sevenDays()}
              </option>
              <option value={Common.Time.Month}>
                {Messages.invites.form.expiresAtOptions.oneMonth()}
              </option>
              <option value={undefined}>
                {Messages.invites.form.expiresAtOptions.never()}
              </option>
            </NativeSelect>
          </FormControl>

          <FormControl>
            <InputLabel>{Messages.invites.form.labels.maxUses()}</InputLabel>
            <NativeSelect value={maxUses} onChange={handleMaxUsesChange}>
              <option aria-label={Messages.forms.none()} value="" />
              <option value={undefined}>
                {Messages.invites.form.maxUsesOptions.noLimit()}
              </option>
              {ServerInvites.MAX_USES_OPTIONS.map((option) => {
                return (
                  <option value={option} key={option}>
                    {Messages.invites.form.maxUsesOptions.xUses(option)}
                  </option>
                );
              })}
            </NativeSelect>
          </FormControl>
        </FormGroup>

        <SubmitButton>{Messages.actions.create()}</SubmitButton>
      </form>
    );
  return <></>;
};

export default ServerInviteForm;
