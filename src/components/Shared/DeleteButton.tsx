import {
  Button as MUIButton,
  ButtonProps,
  createStyles,
  Theme,
  withStyles,
} from "@material-ui/core";

const Button = withStyles((theme: Theme) =>
  createStyles({
    root: {
      borderRadius: 8,
      color: "tomato",
      backgroundColor: theme.palette.secondary.dark,
      "&:hover": {
        backgroundColor: "rgb(60, 60, 60)",
      },
    },
  })
)(MUIButton);

const DeleteButton = (props: ButtonProps) => {
  return (
    <Button variant="text" fullWidth color="primary" {...props}>
      {props.children}
    </Button>
  );
};

export default DeleteButton;
