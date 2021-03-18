import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import Router from "next/router";

import { SIGN_IN, SET_CURRENT_USER } from "../../apollo/client/mutations";
import { setAuthToken } from "../../utils/auth";

const Login = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const [signIn] = useMutation(SIGN_IN);
  const [setCurrentUser] = useMutation(SET_CURRENT_USER);

  const handleSubmit = async (e) => {
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
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="text"
          placeholder="Email"
          onChange={(e) => setUserEmail(e.target.value)}
          value={userEmail}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          onChange={(e) => setUserPassword(e.target.value)}
          value={userPassword}
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Log in
      </Button>
    </Form>
  );
};

export default Login;
