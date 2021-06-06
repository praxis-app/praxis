import { Edit, Delete, MoreVert } from "@material-ui/icons";
import { Menu, MenuItem, IconButton } from "@material-ui/core";
import Link from "next/link";
import Messages from "../../utils/messages";

interface Props {
  name?: string;
  itemId: string;
  itemType: string;
  anchorEl: null | HTMLElement;
  setAnchorEl: (el: null | HTMLElement) => void;
  deleteItem: (id: string) => void;
  ownItem: () => boolean;
  hasPermission?: boolean;
  children?: React.ReactNode;
}

const ItemMenu = ({
  name,
  itemId,
  itemType,
  anchorEl,
  setAnchorEl,
  deleteItem,
  ownItem,
  hasPermission,
  children,
}: Props) => {
  const handleMenuButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (ownItem() || hasPermission)
    return (
      <>
        <IconButton onClick={handleMenuButtonClick}>
          <MoreVert style={{ color: "white" }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            style: {
              backgroundColor: "rgb(65, 65, 65)",
            },
          }}
          MenuListProps={{
            style: {
              color: "white",
            },
          }}
        >
          {ownItem() && (
            <MenuItem>
              <Link href={`/${itemType}s/${name ? name : itemId}/edit`}>
                <a style={{ width: "100%" }}>
                  <Edit
                    fontSize="small"
                    style={{
                      marginRight: "5",
                      transform: "rotateY(180deg)",
                    }}
                  />
                  {Messages.actions.edit()}
                </a>
              </Link>
            </MenuItem>
          )}

          <MenuItem
            onClick={() =>
              window.confirm(Messages.prompts.deleteItem(itemType)) &&
              deleteItem(itemId)
            }
          >
            <Delete fontSize="small" style={{ marginRight: "5" }} />
            {Messages.actions.delete()}
          </MenuItem>

          {children}
        </Menu>
      </>
    );

  return <></>;
};

export default ItemMenu;
