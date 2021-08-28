// TODO: Implement basic functionality for Search

import { useState } from "react";
import { Search } from "@material-ui/icons";
import {
  Theme,
  withStyles,
  createStyles,
  InputBase as MUIInputBase,
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import clsx from "clsx";

import Messages from "../../utils/messages";
import styles from "../../styles/Shared/SearchBar.module.scss";
import { FieldNames, ToastStatus } from "../../constants/common";
import { toastVar } from "../../apollo/client/localState";

const InputBase = withStyles((theme: Theme) =>
  createStyles({
    root: {
      color: "inherit",
    },
    input: {
      padding: theme.spacing(1, 1, 1, 0),
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create("width"),
      width: 350,
      [theme.breakpoints.down("lg")]: {
        width: 250,
      },
      [theme.breakpoints.down("sm")]: {
        width: 120,
      },
    },
  })
)(MUIInputBase);

const SearchBar = () => {
  const [focused, setFocused] = useState<boolean>(false);

  const handleSubmit = () => {
    toastVar({
      title: Messages.development.notImplemented(),
      status: ToastStatus.Info,
    });
  };

  return (
    <div className={styles.search}>
      <Formik
        initialValues={{
          query: "",
        }}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form>
            <div
              className={clsx(styles.searchIcon, {
                [styles.searchIconFocused]: focused,
              })}
            >
              <Search style={{ color: "inherit", transition: "0.2s" }} />
            </div>
            <Field
              name={FieldNames.Query}
              placeholder={Messages.actions.search()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              component={InputBase}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SearchBar;
