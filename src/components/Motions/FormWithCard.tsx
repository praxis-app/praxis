import { Card, CardContent } from "@material-ui/core";
import MotionsForm, { MotionsFormProps } from "./Form";

const MotionsFormWithCard = (props: MotionsFormProps) => {
  return (
    <Card>
      <CardContent style={{ paddingBottom: 18 }}>
        <MotionsForm {...props} />
      </CardContent>
    </Card>
  );
};

export default MotionsFormWithCard;
