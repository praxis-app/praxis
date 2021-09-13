import React, { useEffect } from "react";
import { useMutation } from "@apollo/client";
import Router from "next/router";
import { Card, CardContent, FormGroup } from "@material-ui/core";
import { Formik, Form, Field } from "formik";

import { SIGN_IN, SET_CURRENT_USER } from "../../apollo/client/mutations";
import { setAuthToken } from "../../utils/auth";
import styles from "../../styles/Shared/Shared.module.scss";
import Messages from "../../utils/messages";
import { LocalStorage, NavigationPaths } from "../../constants/common";
import { FieldNames } from "../../constants/user";
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
    if (currentUser?.isAuthenticated) Router.push(NavigationPaths.Home);
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
      localStorage.setItem(LocalStorage.JwtToken, token);
      setAuthToken(token);
      Router.push(NavigationPaths.Home);
    } catch (err) {
      alert(err);
    }
  };

  if (currentUser) return <>{Messages.users.alreadyLoggedIn()}</>;

  return (
    <Card>
      <CardContent style={{ paddingBottom: 16 }}>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(formik) => (
            <Form>
              <FormGroup
                style={{
                  marginBottom: "6px",
                }}
              >
                <Field
                  name={FieldNames.Email}
                  placeholder={Messages.users.form.email()}
                  component={TextField}
                />
                <Field
                  name={FieldNames.Password}
                  placeholder={Messages.users.form.password()}
                  component={PasswordField}
                />
              </FormGroup>

              <div className={styles.flexEnd}>
                <SubmitButton disabled={formik.isSubmitting}>
                  {Messages.users.actions.logIn()}
                </SubmitButton>
              </div>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default Login;
