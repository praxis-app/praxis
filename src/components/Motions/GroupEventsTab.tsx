import { Typography } from "@material-ui/core";
import { motionActionLabel } from "../../utils/clientIndex";
import Messages from "../../utils/messages";
import EventForm from "../Events/Form";

interface Props {
  setSelectedGroupId: (id: string) => void;
  setActionData: (actionData: ActionData | undefined) => void;
  setAction: (action: string) => void;
  action: string;
  groupId: string;
  resetTabs: () => void;
}

const GroupEventsTab = ({
  setSelectedGroupId,
  setActionData,
  setAction,
  action,
  groupId,
  resetTabs,
}: Props) => {
  const handleSubmit = (groupEvent: EventMotionInput) => {
    const startsAt = new Date(groupEvent.startsAt).getTime().toString();
    const endsAt = groupEvent.endsAt
      ? { endsAt: new Date(groupEvent.endsAt).getTime().toString() }
      : undefined;

    setActionData({
      groupEvent: {
        ...groupEvent,
        ...endsAt,
        startsAt,
      },
    });
    resetTabs();
  };

  const handleCancel = () => {
    setSelectedGroupId("");
    setActionData(undefined);
    setAction("");
    resetTabs();
  };

  return (
    <>
      <Typography style={{ marginBottom: 12 }}>
        {motionActionLabel(action)}
      </Typography>

      <EventForm
        groupId={groupId}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        submitButtonText={Messages.actions.confirm()}
        inMotionForm
      />
    </>
  );
};

export default GroupEventsTab;
