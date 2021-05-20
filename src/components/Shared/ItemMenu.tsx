import { Edit, Delete, MoreVert } from "@material-ui/icons";
import { Menu, MenuItem, IconButton } from "@material-ui/core";
import Link from "next/link";

interface Props {
  name?: string;
  itemId: string;
  itemType: string;
  anchorEl: null | HTMLElement;
  setAnchorEl: (el: null | HTMLElement) => void;
  deleteItem: (id: string) => void;
  ownItem: () => boolean;
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
                Edit
              </a>
            </Link>
          </MenuItem>
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

          {children}
        </Menu>
      </>
    );

  return <></>;
};

export default ItemMenu;
