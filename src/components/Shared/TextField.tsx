import { useEffect, useRef } from "react";
import { useReactiveVar } from "@apollo/client";
import { withStyles, createStyles } from "@material-ui/core";
import {
  TextField as FormikTextField,
  TextFieldProps,
} from "formik-material-ui";
import { useRouter } from "next/router";

import { focusVar } from "../../apollo/client/localState";
import { FocusTargets, ResourcePaths } from "../../constants/common";

const StyledTextField = withStyles(() =>
  createStyles({
    root: {
      marginBottom: 12,
      width: "100%",
    },
  })
)(FormikTextField);

const TextField = (props: TextFieldProps) => {
  const currentFocus = useReactiveVar(focusVar);
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (
      (router.asPath.includes(ResourcePaths.Post) ||
        router.asPath.includes(ResourcePaths.Motion)) &&
      currentFocus === FocusTargets.CommentFormTextField
    ) {
      ref.current?.focus();
    }
  }, [currentFocus]);

  const handleBlur = () => {
    focusVar("");
  };

  return (
    <StyledTextField
      type="text"
      inputRef={ref}
      onBlur={() => handleBlur()}
      {...props}
    />
  );
};

export const PasswordField = (props: TextFieldProps) => {
  return <StyledTextField type="password" {...props} />;
};

export default TextField;
