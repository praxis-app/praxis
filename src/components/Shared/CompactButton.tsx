import {
  ButtonProps,
  createStyles,
  makeStyles,
  Button,
  Theme,
} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: 0,
      minWidth: "initial",
      borderRadius: 4,
    },
    textPrimary: {
      "&:hover": {
        backgroundColor: theme.palette.background.paper,
      },
    },
  })
);

const CompactButton = (props: ButtonProps) => {
  const classes = useStyles();
  return (
    <Button color="primary" classes={classes} {...props}>
      {props.children}
    </Button>
  );
};

export default CompactButton;
