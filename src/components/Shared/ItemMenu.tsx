import { ReactNode } from "react";
import { Edit, Delete, MoreHoriz } from "@material-ui/icons";
import { Menu, MenuItem, IconButton } from "@material-ui/core";
import Link from "next/link";

import Messages from "../../utils/messages";
import { isRenderable } from "../../utils/common";

interface Props {
  name?: string;
  itemId: string;
  itemType: string;
  anchorEl: null | HTMLElement;
  setAnchorEl: (el: null | HTMLElement) => void;
  deleteItem: (id: string) => void;
  children?: ReactNode;
  prependChildren?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const ItemMenu = ({
  name,
  itemId,
  itemType,
  anchorEl,
  setAnchorEl,
  deleteItem,
  children,
  prependChildren,
  canEdit,
  canDelete,
}: Props) => {
  const margin = { marginRight: 7.5 };

  const handleMenuButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (canEdit || canDelete || isRenderable(children))
    return (
      <>
        <IconButton onClick={handleMenuButtonClick}>
          <MoreHoriz color="primary" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {prependChildren && children}

          {canEdit && (
            <MenuItem>
              <Link href={`/${itemType}s/${name ? name : itemId}/edit`}>
                <a style={{ width: "100%" }}>
                  <Edit
                    fontSize="small"
                    style={{
                      ...margin,
                      transform: "rotateY(180deg)",
                    }}
                  />
                  {Messages.actions.edit()}
                </a>
              </Link>
            </MenuItem>
          )}

          {canDelete && (
            <MenuItem
              onClick={() =>
                window.confirm(Messages.prompts.deleteItem(itemType)) &&
                deleteItem(itemId)
              }
            >
              <Delete fontSize="small" style={margin} />
              {Messages.actions.delete()}
            </MenuItem>
          )}

          {!prependChildren && children}
        </Menu>
      </>
    );

  return null;
};

export default ItemMenu;
