import { Card, CardContent } from "@material-ui/core";
import MotionsForm, { MotionsFormProps } from "./Form";

const MotionsFormWithCard = (props: MotionsFormProps) => {
  return (
    <Card>
      <CardContent style={{ marginTop: 12 }}>
        <MotionsForm {...props} />
      </CardContent>
    </Card>
  );
};

export default MotionsFormWithCard;
