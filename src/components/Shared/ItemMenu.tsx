import { ReactNode } from "react";
import Link from "next/link";
import { Edit, Delete, MoreHoriz } from "@material-ui/icons";
import {
  Menu,
  MenuItem,
  IconButton,
  makeStyles,
  createStyles,
} from "@material-ui/core";
import { CSSProperties } from "@material-ui/styles";

import { isRenderable } from "../../utils/clientIndex";
import Messages from "../../utils/messages";
import { NavigationPaths } from "../../constants/common";
import GhostButton from "./GhostButton";

const useStyles = makeStyles(() =>
  createStyles({
    ghostButtonRoot: {
      paddingLeft: 0,
      paddingRight: 0,
      minWidth: 37.5,
    },
    iconRoot: {
      marginRight: 7.5,
    },
    editIconRoot: {
      transform: "rotateY(180deg)",
    },
    fullWidthLink: {
      width: "100%",
    },
  })
);

export const enum ItemMenuVariants {
  Default = "default",
  Ghost = "ghost",
}

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
  variant?: ItemMenuVariants;
  buttonStyle?: CSSProperties;
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
  variant,
  buttonStyle,
}: Props) => {
  const classes = useStyles();

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
        {variant === ItemMenuVariants.Ghost ? (
          <GhostButton
            onClick={handleMenuButtonClick}
            className={classes.ghostButtonRoot}
            style={buttonStyle}
          >
            <MoreHoriz color="primary" />
          </GhostButton>
        ) : (
          <IconButton onClick={handleMenuButtonClick} style={buttonStyle}>
            <MoreHoriz color="primary" />
          </IconButton>
        )}

        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {prependChildren && children}

          {canEdit && (
            <MenuItem>
              <Link
                href={`/${itemType}s/${name ? name : itemId}${
                  NavigationPaths.Edit
                }`}
              >
                <a className={classes.fullWidthLink}>
                  <Edit
                    fontSize="small"
                    className={classes.iconRoot + " " + classes.editIconRoot}
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
              <Delete fontSize="small" className={classes.iconRoot} />
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
