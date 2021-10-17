import { Typography } from "@material-ui/core";
import { Event as EventIcon } from "@material-ui/icons";

interface Props {
  message: string;
}

const NoEvents = ({ message }: Props) => (
  <>
    <Typography align="center" style={{ marginTop: 12 }}>
      <EventIcon color="secondary" style={{ fontSize: 80 }} />
    </Typography>
    <Typography align="center" gutterBottom>
      {message}
    </Typography>
  </>
);

export default NoEvents;
