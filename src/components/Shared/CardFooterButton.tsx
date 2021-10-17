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
      paddingLeft: 12,
      paddingRight: 12,
    },
  })
);

const CardFooterButton = (props: ButtonProps) => {
  const classes = useStyles();

  return (
    <Button color="primary" classes={classes} {...props}>
      {props.children}
    </Button>
  );
};

export default CardFooterButton;
