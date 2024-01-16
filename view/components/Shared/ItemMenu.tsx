import { Delete, Edit, MoreHoriz } from '@mui/icons-material';
import {
  IconButton,
  IconButtonProps,
  Menu,
  MenuItem,
  SxProps,
} from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import GhostButton from './GhostButton';
import Spinner from './Spinner';

interface Props {
  anchorEl: HTMLElement | null;
  buttonStyles?: SxProps;
  canDelete?: boolean;
  canUpdate?: boolean;
  children?: ReactNode;
  deleteBtnLabel?: string;
  deleteItem?: () => void;
  deletePrompt?: string;
  edge?: IconButtonProps['edge'];
  editPath?: string;
  loading?: boolean;
  onEditButtonClick?: () => void;
  prependChildren?: boolean;
  setAnchorEl: (el: HTMLElement | null) => void;
  variant?: 'ghost' | 'default';
}

const ItemMenu = ({
  anchorEl,
  buttonStyles,
  canDelete,
  canUpdate,
  children,
  deleteBtnLabel,
  deleteItem,
  deletePrompt,
  edge,
  editPath,
  loading,
  onEditButtonClick,
  prependChildren,
  setAnchorEl,
  variant,
}: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!canUpdate && !canDelete && !children) {
    return null;
  }
  const showEditButton = canUpdate && (editPath || onEditButtonClick);
  const showDeleteButton = canDelete && deleteItem && deletePrompt;
  const Button = variant === 'ghost' ? GhostButton : IconButton;

  const editIconStyles: SxProps = {
    marginBottom: 0.8,
    marginRight: 1,
    transform: 'rotateY(180deg) translateY(2px)',
  };
  const menuButtonStyles: SxProps = {
    '&:hover': { color: variant === 'ghost' ? 'text.primary' : undefined },
    color: 'text.secondary',
    ...buttonStyles,
  };

  const handleMenuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleEditButtonClick = () => {
    if (onEditButtonClick) {
      onEditButtonClick();
      return;
    }
    if (!editPath) {
      return;
    }
    navigate(editPath);
  };

  const handleDelete = () => {
    if (!deleteItem) {
      return;
    }
    deleteItem();
    handleClose();
  };

  const handleDeleteWithPrompt = () =>
    window.confirm(deletePrompt) && handleDelete();

  return (
    <>
      <Button
        aria-label={t('labels.menuButton')}
        onClick={handleMenuButtonClick}
        sx={menuButtonStyles}
        edge={edge}
      >
        {loading ? (
          <Spinner size={10} sx={{ marginY: '7px' }} />
        ) : (
          <MoreHoriz />
        )}
      </Button>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        onClose={handleClose}
        open={Boolean(anchorEl)}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
        sx={{
          transform: `translateY(${variant === 'ghost' ? 4 : 1}px)`,
        }}
      >
        {prependChildren && children}

        {showEditButton && (
          <MenuItem onClick={handleEditButtonClick}>
            <Edit fontSize="small" sx={editIconStyles} />
            {t('actions.edit')}
          </MenuItem>
        )}

        {showDeleteButton && (
          <MenuItem onClick={handleDeleteWithPrompt}>
            <Delete fontSize="small" sx={{ marginRight: 1 }} />
            {deleteBtnLabel || t('actions.delete')}
          </MenuItem>
        )}

        {!prependChildren && children}
      </Menu>
    </>
  );
};

export default ItemMenu;
