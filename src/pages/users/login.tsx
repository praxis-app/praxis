import React, { useEffect } from "react";
import { useMutation } from "@apollo/client";
import Router from "next/router";
import { FormGroup } from "@material-ui/core";
import { Formik, Form, Field } from "formik";

import { SIGN_IN, SET_CURRENT_USER } from "../../apollo/client/mutations";
import { setAuthToken } from "../../utils/auth";
import styles from "../../styles/Shared/Shared.module.scss";
import Messages from "../../utils/messages";
import { Common, Users } from "../../constants";
import { useCurrentUser } from "../../hooks";
import SubmitButton from "../../components/Shared/SubmitButton";
import TextField, { PasswordField } from "../../components/Shared/TextField";

interface FormValues {
  email: string;
  password: string;
}

const Login = () => {
  const currentUser = useCurrentUser();
  const [signIn] = useMutation(SIGN_IN);
  const [setCurrentUserCache] = useMutation(SET_CURRENT_USER);
  const initialValues = {
    email: "",
    password: "",
  };

  useEffect(() => {
    if (currentUser?.isAuthenticated) Router.push("/");
  }, [currentUser]);

  const handleSubmit = async ({ email, password }: FormValues) => {
    try {
      const { data } = await signIn({
        variables: {
          email,
          password,
        },
      });
      const { user, token } = data.signIn;
      await setCurrentUserCache({
        variables: {
          id: user.id,
          name: user.name,
          email: user.email,
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
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {(formik) => (
        <Form className={styles.form}>
          <FormGroup
            style={{
              marginBottom: "6px",
            }}
          >
            <Field
              name={Users.FieldNames.Email}
              placeholder={Messages.users.form.email()}
              component={TextField}
            />
            <Field
              name={Users.FieldNames.Password}
              placeholder={Messages.users.form.password()}
              component={PasswordField}
            />
          </FormGroup>

          <SubmitButton disabled={!!formik.submitCount}>
            {Messages.users.actions.logIn()}
          </SubmitButton>
        </Form>
      )}
    </Formik>
  );
};

export default Login;
