import { withStyles, createStyles } from "@material-ui/core";
import {
  TextField as FormikTextField,
  TextFieldProps,
} from "formik-material-ui";

const commonStyles = createStyles({
  root: {
    marginBottom: 12,
    width: "100%",
  },
});
const StyledTextField = withStyles(() => commonStyles)(FormikTextField);

const TextField = (props: TextFieldProps) => {
  return <StyledTextField type="text" {...props} />;
};

export const PasswordField = (props: TextFieldProps) => {
  return <StyledTextField type="password" {...props} />;
};

export default TextField;
