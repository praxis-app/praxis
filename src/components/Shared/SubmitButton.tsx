import { Button } from "@material-ui/core";

interface Props {
  children?: React.ReactNode;
}

const SubmitButton = ({ children }: Props) => {
  return (
    <Button type="submit" variant="contained" color="primary">
      {children}
    </Button>
  );
};

export default SubmitButton;
