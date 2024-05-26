import { useReactiveVar } from '@apollo/client';
import { Close } from '@mui/icons-material';
import { Alert, IconButton, Snackbar, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  isChatPanelOpenVar,
  scrollDirectionVar,
  toastVar,
} from '../../graphql/cache';
import { useAboveBreakpoint } from '../../hooks/shared.hooks';

const AUTO_HIDE_DURATION = 6000;

const Toast = () => {
  const isChatPanelOpen = useReactiveVar(isChatPanelOpenVar);
  const scrollDirection = useReactiveVar(scrollDirectionVar);
  const toastNotification = useReactiveVar(toastVar);
  const [open, setOpen] = useState(false);

  const isAboveSmall = useAboveBreakpoint('sm');
  const theme = useTheme();

  const isNavHidden =
    !isAboveSmall && !isChatPanelOpen && scrollDirection === 'down';
  const distanceFromBottom = isNavHidden ? 12 : 80;

  useEffect(() => {
    if (toastNotification) {
      setOpen(true);
    }
  }, [toastNotification]);

  useEffect(
    () => () => {
      toastVar(null);
      setOpen(false);
    },
    [],
  );

  const handleClose = () => {
    setOpen(false);
  };

  if (!toastNotification) {
    return null;
  }

  return (
    <Snackbar
      sx={{ bottom: distanceFromBottom, transition: 'bottom 220ms' }}
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      autoHideDuration={AUTO_HIDE_DURATION}
      onClose={handleClose}
      open={open}
    >
      <Alert
        action={
          <IconButton size="small" onClick={handleClose}>
            <Close
              fontSize="small"
              sx={{ color: theme.palette.primary.main }}
            />
          </IconButton>
        }
        severity={toastNotification.status}
        sx={{ color: theme.palette.text.primary }}
        variant="filled"
      >
        {toastNotification.title}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
