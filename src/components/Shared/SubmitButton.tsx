import { Button } from "@material-ui/core";

interface Props {
  children?: React.ReactNode;
}

const SubmitButton = ({ children }: Props) => {
  return (
    <Button
      type="submit"
      variant="contained"
      style={{ color: "white", backgroundColor: "rgb(65, 65, 65)" }}
    >
      {children}
    </Button>
  );
};

export default SubmitButton;
