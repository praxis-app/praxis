import { useState } from "react";
import { CSSProperties } from "@material-ui/styles";
import { ModelNames } from "../../constants/common";
import ItemMenu, { ItemMenuVariants } from "../Shared/ItemMenu";
import {
  useHasPermissionByGroupId,
  useHasPermissionGlobally,
} from "../../hooks";
import { GlobalPermissions, GroupPermissions } from "../../constants/role";

interface Props {
  event: ClientEvent;
  deleteEvent: (id: string) => void;
  isHosting: boolean;
  style?: CSSProperties;
}

const EventItemMenu = ({
  event: { id, groupId },
  deleteEvent,
  isHosting,
  style,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [canMangeEventsGlobally] = useHasPermissionGlobally(
    GlobalPermissions.ManageEvents
  );
  const [canManageEventsByGroup] = useHasPermissionByGroupId(
    GroupPermissions.ManageEvents,
    groupId
  );

  return (
    <ItemMenu
      itemId={id}
      itemType={ModelNames.Event}
      anchorEl={menuAnchorEl}
      setAnchorEl={setMenuAnchorEl}
      deleteItem={deleteEvent}
      canDelete={canMangeEventsGlobally || canManageEventsByGroup}
      canEdit={isHosting}
      variant={ItemMenuVariants.Ghost}
      buttonStyle={style}
    />
  );
};

export default EventItemMenu;
