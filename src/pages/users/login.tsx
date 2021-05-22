import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import Router from "next/router";
import { Input, Button, FormGroup } from "@material-ui/core";

import { CURRENT_USER } from "../../apollo/client/queries";
import { SIGN_IN, SET_CURRENT_USER } from "../../apollo/client/mutations";
import { isLoggedIn, setAuthToken } from "../../utils/auth";

import styles from "../../styles/User/UserForm.module.scss";
import Messages from "../../utils/messages";
import { Common } from "../../constants";

const Login = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [signIn] = useMutation(SIGN_IN);
  const [setCurrentUserCache] = useMutation(SET_CURRENT_USER);
  const currentUserRes = useQuery(CURRENT_USER);

  useEffect(() => {
    if (currentUser?.isAuthenticated) Router.push("/");
  }, [currentUser]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

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

  if (isLoggedIn(currentUser)) return <>{Messages.users.alreadyLoggedIn()}</>;

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <FormGroup
        style={{
          marginBottom: "6px",
        }}
      >
        <Input
          type="text"
          placeholder={Messages.users.form.email()}
          onChange={(e) => setUserEmail(e.target.value)}
          value={userEmail}
          style={{
            marginBottom: "12px",
            color: "rgb(170, 170, 170)",
          }}
        />
        <Input
          type="password"
          placeholder={Messages.users.form.password()}
          onChange={(e) => setUserPassword(e.target.value)}
          value={userPassword}
          style={{
            marginBottom: "12px",
            color: "rgb(170, 170, 170)",
          }}
        />
      </FormGroup>

      <Button
        variant="contained"
        type="submit"
        style={{ color: "white", backgroundColor: "rgb(65, 65, 65)" }}
      >
        {Messages.users.actions.logIn()}
      </Button>
    </form>
  );
};

export default Login;
