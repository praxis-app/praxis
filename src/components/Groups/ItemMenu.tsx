import { MenuItem } from "@material-ui/core";
import { AccountBox, Settings } from "@material-ui/icons";
import Link from "next/link";
import { useState } from "react";

import {
  ModelNames,
  NavigationPaths,
  ResourcePaths,
} from "../../constants/common";
import Messages from "../../utils/messages";
import ItemMenu from "../Shared/ItemMenu";

interface Props {
  group: ClientGroup;
  deleteGroup: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  canManageSettings: boolean;
  canManageRoles: boolean;
}

const GroupItemMenu = ({
  group: { id, name },
  deleteGroup,
  canEdit,
  canDelete,
  canManageRoles,
  canManageSettings,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <ItemMenu
      itemId={id}
      name={name}
      itemType={ModelNames.Group}
      anchorEl={menuAnchorEl}
      setAnchorEl={setMenuAnchorEl}
      deleteItem={deleteGroup}
      canEdit={canEdit}
      canDelete={canDelete}
    >
      {canManageSettings && (
        <Link href={`${ResourcePaths.Group}${name}${NavigationPaths.Settings}`}>
          <a>
            <MenuItem>
              <Settings
                fontSize="small"
                style={{
                  marginRight: "5",
                }}
              />
              {Messages.groups.settings.name()}
            </MenuItem>
          </a>
        </Link>
      )}
      {canManageRoles && (
        <Link href={`${ResourcePaths.Group}${name}${NavigationPaths.Roles}`}>
          <a>
            <MenuItem>
              <AccountBox
                fontSize="small"
                style={{
                  marginRight: "5",
                }}
              />
              {Messages.groups.actions.manageRoles()}
            </MenuItem>
          </a>
        </Link>
      )}
    </ItemMenu>
  );
};

export default GroupItemMenu;
