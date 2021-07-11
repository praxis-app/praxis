import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import Router from "next/router";
import { FormGroup } from "@material-ui/core";

import { SIGN_IN, SET_CURRENT_USER } from "../../apollo/client/mutations";
import { setAuthToken } from "../../utils/auth";

import styles from "../../styles/Shared/Shared.module.scss";
import Messages from "../../utils/messages";
import { Common } from "../../constants";
import { useCurrentUser } from "../../hooks";
import SubmitButton from "../../components/Shared/SubmitButton";
import TextInput, { PasswordInput } from "../../components/Shared/TextInput";

const Login = () => {
  const currentUser = useCurrentUser();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("");
  const [signIn] = useMutation(SIGN_IN);
  const [setCurrentUserCache] = useMutation(SET_CURRENT_USER);

  useEffect(() => {
    if (currentUser?.isAuthenticated) Router.push("/");
  }, [currentUser]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const { data } = await signIn({
        variables: {
          email: userEmail,
          password: userPassword,
        },
      });

      const {
        user: { id, name, email },
        token,
      } = data.signIn;

      await setCurrentUserCache({
        variables: {
          id,
          name,
          email,
        },
      });

      localStorage.setItem(Common.LocalStorage.JwtToken, token);
      setAuthToken(token);
      Router.push("/");
    } catch (err) {
      alert(err);
    }
  };

  if (currentUser) return <>{Messages.users.alreadyLoggedIn()}</>;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <FormGroup
        style={{
          marginBottom: "6px",
        }}
      >
        <TextInput
          placeholder={Messages.users.form.email()}
          onChange={(e) => setUserEmail(e.target.value)}
          value={userEmail}
        />
        <PasswordInput
          placeholder={Messages.users.form.password()}
          onChange={(e) => setUserPassword(e.target.value)}
          value={userPassword}
        />
      </FormGroup>

      <SubmitButton>{Messages.users.actions.logIn()}</SubmitButton>
    </form>
  );
};

export default Login;
