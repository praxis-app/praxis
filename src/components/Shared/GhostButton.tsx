// Ghost Button, from A comprehensive guide to designing UX buttons
// https://www.invisionapp.com/inside-design/comprehensive-guide-designing-ux-buttons/

import {
  Button as MUIButton,
  ButtonProps,
  createStyles,
  withStyles,
} from "@material-ui/core";

const Button = withStyles(() =>
  createStyles({
    root: {
      fontFamily: "Inter Bold",
      letterSpacing: "0.2px",
      textTransform: "none",
      borderRadius: 8,
    },
  })
)(MUIButton);

const GhostButton = (props: ButtonProps) => {
  return (
    <Button variant="outlined" color="primary" {...props}>
      {props.children}
    </Button>
  );
};

export default GhostButton;
