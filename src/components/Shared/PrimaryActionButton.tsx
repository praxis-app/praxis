import {
  Button as MUIButton,
  ButtonProps,
  createStyles,
  withStyles,
} from "@material-ui/core";
import { BLURPLE_BUTTON_COLORS } from "../../styles/Shared/theme";

const Button = withStyles(() =>
  createStyles({
    root: {
      fontFamily: "Inter Bold",
      letterSpacing: "0.2px",
      textTransform: "none",
      borderRadius: 8,
      minWidth: 80,
      ...BLURPLE_BUTTON_COLORS,
    },
    disabled: {
      backgroundColor: "#4C5B91 !important",
    },
  })
)(MUIButton);

const PrimaryActionButton = (props: ButtonProps) => {
  return (
    <Button variant="contained" color="primary" {...props}>
      {props.children}
    </Button>
  );
};

export default PrimaryActionButton;
