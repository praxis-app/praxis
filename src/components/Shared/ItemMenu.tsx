import { Edit, Delete, MoreVert } from "@material-ui/icons";
import { Menu, MenuItem, IconButton } from "@material-ui/core";
import Link from "next/link";

interface Props {
  itemId: string;
  itemType: string;
  anchorEl: null | HTMLElement;
  setAnchorEl: (el: null | HTMLElement) => void;
  deleteItem: (id: string) => void;
  ownItem: () => boolean;
}

const ItemMenu = ({
  itemId,
  itemType,
  anchorEl,
  setAnchorEl,
  deleteItem,
  ownItem,
}: Props) => {
  const handleMenuButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (ownItem())
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
          <Link href={`/${itemType}s/${itemId}/edit`}>
            <a>
              <MenuItem>
                <Edit
                  fontSize="small"
                  style={{
                    marginRight: "5",
                    transform: "rotateY(180deg)",
                  }}
                />
                Edit
              </MenuItem>
            </a>
          </Link>
          <MenuItem
            onClick={() =>
              window.confirm(
                `Are you sure you want to delete this ${itemType}?`
              ) && deleteItem(itemId)
            }
          >
            <Delete fontSize="small" style={{ marginRight: "5" }} />
            Delete
          </MenuItem>
        </Menu>
      </>
    );

  return <></>;
};

export default ItemMenu;
