import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  Card,
  CardContent,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
} from "@material-ui/core";

import { CREATE_SERVER_INVITE } from "../../apollo/client/mutations";
import styles from "../../styles/ServerInvite/ServerInvite.module.scss";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import {
  EXPIRES_AT_OPTIONS,
  MAX_USES_OPTIONS,
} from "../../constants/serverInvite";
import SubmitButton from "../Shared/SubmitButton";
import Dropdown from "../Shared/Dropdown";
import { errorToast } from "../../utils/clientIndex";

interface Props {
  invites: ClientServerInvite[];
  setInvites: (roles: ClientServerInvite[]) => void;
}

const ServerInviteForm = ({ invites, setInvites }: Props) => {
  const currentUser = useCurrentUser();
  const [maxUses, setMaxUses] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [createServerInvite] = useMutation(CREATE_SERVER_INVITE);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (currentUser) {
      try {
        setMaxUses("");
        setExpiresAt("");
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
        errorToast(err);
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
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FormGroup style={{ marginBottom: "12px" }}>
              <FormControl>
                <InputLabel>
                  {Messages.invites.form.labels.expiresAt()}
                </InputLabel>
                <Dropdown value={expiresAt} onChange={handleExpiresAtChange}>
                  {EXPIRES_AT_OPTIONS.map((option) => (
                    <MenuItem value={option.value} key={option.value}>
                      {option.message}
                    </MenuItem>
                  ))}
                </Dropdown>
              </FormControl>

              <FormControl>
                <InputLabel>
                  {Messages.invites.form.labels.maxUses()}
                </InputLabel>
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

            <div className={styles.flexEnd}>
              <SubmitButton>{Messages.invites.actions.generate()}</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  return null;
};

export default ServerInviteForm;
