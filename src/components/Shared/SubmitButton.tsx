import { Button, ButtonProps } from "@material-ui/core";

const SubmitButton = (props: ButtonProps) => {
  return (
    <Button type="submit" variant="contained" color="primary" {...props}>
      {props.children}
    </Button>
  );
};

export default SubmitButton;
