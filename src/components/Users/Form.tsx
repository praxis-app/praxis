import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Router from "next/router";
import { FormGroup, TextField, Button } from "@material-ui/core";

import {
  SIGN_UP,
  UPDATE_USER,
  SET_CURRENT_USER,
} from "../../apollo/client/mutations";
import { CURRENT_USER } from "../../apollo/client/queries";
import { setAuthToken } from "../../utils/auth";

interface Props {
  user?: User;
  isEditing?: boolean;
}

const UserForm = ({ user, isEditing }: Props) => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userPasswordConfirm, setUserPasswordConfirm] = useState("");

  const [signUp] = useMutation(SIGN_UP);
  const [updateUser] = useMutation(UPDATE_USER);
  const [setCurrentUser] = useMutation(SET_CURRENT_USER);
  const currentUserRes = useQuery(CURRENT_USER);

  useEffect(() => {
    if (isEditing) {
      setUserName(user.name);
      setUserEmail(user.email);
    }
  }, [user, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      // Update a user
      try {
        if (currentUserRes.data) {
          const { data } = await updateUser({
            variables: {
              id: user.id,
              name: userName,
              email: userEmail,
            },
          });

          if (parseInt(currentUserRes.data.user.id) === parseInt(user.id)) {
            localStorage.setItem("jwtToken", data.updateUser.token);
            setAuthToken(data.updateUser.token);

            const { id, name, email } = data.updateUser.user;
            await setCurrentUser({
              variables: {
                id,
                name,
                email,
              },
            });
          }

          Router.push(`/users/${data.updateUser.user.name}`);
        }
      } catch {}
    } else {
      // Sign up new user
      try {
        const { data } = await signUp({
          variables: {
            name: userName,
            email: userEmail,
            password: userPassword,
            passwordConfirm: userPasswordConfirm,
          },
        });

        const { id, name, email } = data.signUp.user;
        await setCurrentUser({
          variables: {
            id,
            name,
            email,
          },
        });

        localStorage.setItem("jwtToken", data.signUp.token);
        setAuthToken(data.signUp.token);
        Router.push("/");
      } catch (err) {
        alert(err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup>
        <TextField
          type="text"
          placeholder="Name"
          onChange={(e) => setUserName(e.target.value)}
          value={userName}
          variant="outlined"
          margin="normal"
          label="Name"
        />
        <TextField
          type="text"
          placeholder="Email"
          onChange={(e) => setUserEmail(e.target.value)}
          value={userEmail}
          variant="outlined"
          margin="normal"
          label="Email"
        />
      </FormGroup>

      {!isEditing && (
        <>
          <FormGroup>
            <TextField
              type="password"
              placeholder="Password"
              onChange={(e) => setUserPassword(e.target.value)}
              value={userPassword}
              variant="outlined"
              margin="normal"
              label="Password"
            />
            <TextField
              type="password"
              placeholder="Confirm Password"
              onChange={(e) => setUserPasswordConfirm(e.target.value)}
              value={userPasswordConfirm}
              variant="outlined"
              margin="normal"
              label="Confirm Password"
            />
          </FormGroup>
        </>
      )}

      <Button variant="outlined" color="default" size="large" type="submit">
        {isEditing ? "Save" : "Sign up"}
      </Button>
    </form>
  );
};

export default UserForm;
