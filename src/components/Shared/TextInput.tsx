import { withStyles, createStyles, Input, InputProps } from "@material-ui/core";

const StyledInput = withStyles(() =>
  createStyles({
    root: {
      marginBottom: 12,
    },
  })
)(Input);

export const PasswordInput = (props: InputProps) => {
  return <StyledInput type="password" {...props} />;
};

const TextInput = (props: InputProps) => {
  return <StyledInput type="text" {...props} />;
};

export default TextInput;
