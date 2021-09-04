import { Card, CardContent } from "@material-ui/core";
import SettingsForm, { SettingsFormProps } from "./Form";

const SettingsFormWithCard = (props: SettingsFormProps) => {
  return (
    <Card>
      <CardContent>
        <SettingsForm {...props} />
      </CardContent>
    </Card>
  );
};

export default SettingsFormWithCard;
