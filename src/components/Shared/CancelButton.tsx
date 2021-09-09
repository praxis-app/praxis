import {
  Button as MUIButton,
  ButtonProps,
  createStyles,
  withStyles,
} from "@material-ui/core";
import Messages from "../../utils/messages";

const Button = withStyles(() =>
  createStyles({
    root: {
      fontFamily: "Inter Bold",
      textTransform: "none",
      minWidth: 80,
    },
  })
)(MUIButton);

const CancelButton = (props: ButtonProps) => {
  return (
    <Button variant="contained" color="secondary" {...props}>
      {props.children ? props.children : Messages.actions.cancel()}
    </Button>
  );
};

export default CancelButton;
