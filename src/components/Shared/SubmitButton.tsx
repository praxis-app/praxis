import { ButtonProps, makeStyles } from "@material-ui/core";
import Messages from "../../utils/messages";
import PrimaryActionButton from "./PrimaryActionButton";

const useStyles = makeStyles({ root: { borderRadius: 9999 } });

const SubmitButton = (props: ButtonProps) => {
  const classes = useStyles();
  return (
    <PrimaryActionButton type="submit" classes={classes} {...props}>
      {props.children ? props.children : Messages.actions.submit()}
    </PrimaryActionButton>
  );
};

export default SubmitButton;
