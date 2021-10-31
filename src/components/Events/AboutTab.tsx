import { Card, CardContent, Typography } from "@material-ui/core";
import Messages from "../../utils/messages";

interface Props {
  event: ClientEvent;
}

const EventsAboutTab = ({ event: { description } }: Props) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{Messages.events.whatToExpect()}</Typography>
        <Typography>{description}</Typography>
      </CardContent>
    </Card>
  );
};

export default EventsAboutTab;
