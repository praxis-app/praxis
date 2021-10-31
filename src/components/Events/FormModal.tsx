import { useEffect, useState } from "react";
import { useReactiveVar } from "@apollo/client";
import { modalOpenVar } from "../../apollo/client/localState";
import { ModelNames } from "../../constants/common";
import Messages from "../../utils/messages";
import Modal from "../Shared/Modal";
import EventsForm from "./Form";

interface Props {
  group: ClientGroup;
}

const EventFormModal = ({ group }: Props) => {
  const openFromGlobal = useReactiveVar(modalOpenVar);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (openFromGlobal === ModelNames.Event) setOpen(true);
    else setOpen(false);
  }, [openFromGlobal]);

  useEffect(() => {
    return () => {
      modalOpenVar("");
    };
  }, []);

  return (
    <Modal
      open={open}
      onClose={() => modalOpenVar("")}
      title={Messages.events.actions.create()}
      subtext={group.name}
      appBar
    >
      <EventsForm groupId={group.id} closeModal={() => setOpen(false)} />
    </Modal>
  );
};

export default EventFormModal;
