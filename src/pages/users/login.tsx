import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import Router from "next/router";
import { Input, Button, FormGroup } from "@material-ui/core";

import { SIGN_IN, SET_CURRENT_USER } from "../../apollo/client/mutations";
import { setAuthToken } from "../../utils/auth";

const Login = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const [signIn] = useMutation(SIGN_IN);
  const [setCurrentUser] = useMutation(SET_CURRENT_USER);

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

      await setCurrentUser({
        variables: {
          id,
          name,
          email,
        },
      });

      localStorage.setItem("jwtToken", token);
      setAuthToken(token);
      Router.push("/");
    } catch (err) {
      alert(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup
        style={{
          marginBottom: "6px",
        }}
      >
        <Input
          type="text"
          placeholder="Email"
          onChange={(e) => setUserEmail(e.target.value)}
          value={userEmail}
          style={{
            marginBottom: "12px",
            color: "rgb(170, 170, 170)",
          }}
        />
        <Input
          type="password"
          placeholder="Password"
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
        Log in
      </Button>
    </form>
  );
};

export default Login;
