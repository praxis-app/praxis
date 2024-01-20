import { Close } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogProps,
  IconButton,
  SxProps,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import { KeyboardEvent, ReactNode } from 'react';
import { KeyCodes } from '../../constants/shared.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';

interface Props {
  actionLabel?: string;
  appBarContent?: ReactNode;
  centeredTitle?: boolean;
  children: ReactNode;
  closingAction?(): void;
  contentStyles?: SxProps;
  footerContent?: ReactNode;
  maxWidth?: DialogProps['maxWidth'];
  onClose(): void;
  open: boolean;
  subtext?: string;
  title?: string;
  topGap?: string | number;
  isLoading?: boolean;
}

const Modal = ({
  actionLabel,
  appBarContent,
  centeredTitle,
  children,
  closingAction,
  contentStyles,
  footerContent,
  maxWidth,
  onClose,
  open,
  subtext,
  title,
  isLoading,
  topGap,
}: Props) => {
  const isDesktop = useIsDesktop();
  const theme = useTheme();

  const titleBoxStyles: SxProps = {
    flex: 1,
    marginLeft: 1.25,
    marginTop: subtext ? 0.6 : 0,
  };
  const appBarStyles: SxProps = {
    borderBottom: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    position: 'relative',
  };
  const dialogContentStyles: SxProps = isDesktop
    ? {
        minHeight: '50vh',
        width: '600px',
        ...contentStyles,
      }
    : contentStyles || {};

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.code !== KeyCodes.Escape) {
      return;
    }
    onClose();
  };

  const renderAppBarContent = () => {
    if (appBarContent) {
      return appBarContent;
    }
    if (centeredTitle) {
      return (
        <Toolbar>
          <Box sx={titleBoxStyles}>
            <Typography variant="h6" align="center" lineHeight={1.6}>
              {title}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            color="primary"
            edge="start"
            onClick={onClose}
          >
            <Close />
          </IconButton>
        </Toolbar>
      );
    }
    return (
      <Toolbar>
        <IconButton
          aria-label="close"
          color="primary"
          edge="start"
          onClick={onClose}
        >
          <Close />
        </IconButton>
        <Box sx={titleBoxStyles}>
          <Typography variant="h6" lineHeight={subtext ? 0.9 : 1.6}>
            {title}
          </Typography>

          {subtext && (
            <Typography sx={{ fontSize: 14, marginLeft: 0.2 }}>
              {subtext}
            </Typography>
          )}
        </Box>
        {closingAction && actionLabel && (
          <Button
            disabled={isLoading}
            onClick={closingAction}
            startIcon={
              isLoading && (
                <CircularProgress
                  size={10}
                  sx={{ marginRight: '4px', color: 'inherit' }}
                />
              )
            }
          >
            {actionLabel}
          </Button>
        )}
      </Toolbar>
    );
  };

  return (
    <Dialog
      fullScreen={!isDesktop}
      maxWidth={maxWidth}
      onKeyDown={handleKeyDown}
      open={open}
      sx={{ marginTop: topGap }}
      // Required for mobile
      slotProps={{ backdrop: { onClick: onClose } }}
      // Required for desktop
      onClose={onClose}
    >
      <AppBar sx={appBarStyles}>{renderAppBarContent()}</AppBar>
      <DialogContent sx={dialogContentStyles}>{children}</DialogContent>
      {footerContent}
    </Dialog>
  );
};

export default Modal;
