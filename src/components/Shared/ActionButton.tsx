import {
  ButtonProps,
  createStyles,
  makeStyles,
  Button,
} from "@material-ui/core";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      textTransform: "none",
    },
  })
);

const ActionButton = (props: ButtonProps) => {
  const classes = useStyles();

  return (
    <Button color="primary" classes={classes} {...props}>
      {props.children}
    </Button>
  );
};

export default ActionButton;
