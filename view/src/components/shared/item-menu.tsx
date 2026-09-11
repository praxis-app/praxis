// TODO: Make confirm dialog optional for deleteItem prop

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/shared.utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuPencil, LuTrash } from 'react-icons/lu';
import { MdMoreHoriz } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

interface Props {
  canDelete?: boolean;
  canUpdate?: boolean;
  children?: ReactNode;
  className?: string;
  deleteBtnLabel?: string;
  deleteItem?: () => void;
  deletePrompt?: string;
  editPath?: string;
  loading?: boolean;
  onEditButtonClick?: () => void;
  prependChildren?: boolean;
  updateBtnLabel?: string;
  variant?: 'ghost' | 'outline';
}

export const ItemMenu = ({
  canDelete,
  canUpdate,
  children,
  className,
  deleteBtnLabel,
  deleteItem,
  deletePrompt,
  editPath,
  loading,
  onEditButtonClick,
  prependChildren,
  updateBtnLabel,
  variant = 'ghost',
}: Props) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!canUpdate && !canDelete && !children) {
    return null;
  }
  const showEditButton = canUpdate && (editPath || onEditButtonClick);
  const showDeleteButton = canDelete && deleteItem && deletePrompt;

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
    setIsDeleteDialogOpen(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Menu"
          className={cn('h-9 w-9 p-0', className)}
          variant={variant === 'ghost' ? 'ghost' : 'outline'}
          size="icon"
          disabled={loading}
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <MdMoreHoriz className="size-6" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(variant === 'ghost' && 'mt-1')}
      >
        {prependChildren && children}

        {showEditButton && (
          <DropdownMenuItem onClick={handleEditButtonClick}>
            <LuPencil className="h-4 w-4" />
            {updateBtnLabel || t('actions.edit')}
          </DropdownMenuItem>
        )}

        {showDeleteButton && (
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            variant="destructive"
          >
            <LuTrash className="h-4 w-4" />
            {deleteBtnLabel || t('actions.delete')}
          </DropdownMenuItem>
        )}

        {!prependChildren && children}
      </DropdownMenuContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader className="mt-9">
            <DialogTitle className="text-md font-normal">
              {deletePrompt}
            </DialogTitle>
            <VisuallyHidden>
              <DialogDescription>{deletePrompt}</DialogDescription>
            </VisuallyHidden>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 self-center">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t('actions.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {deleteBtnLabel || t('actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
};
