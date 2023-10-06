import { useReactiveVar } from '@apollo/client';
import { Close } from '@mui/icons-material';
import { Alert, IconButton, Snackbar, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { toastVar } from '../../apollo/cache';

const AUTO_HIDE_DURATION = 6000;

const Toast = () => {
  const toastNotification = useReactiveVar(toastVar);
  const [open, setOpen] = useState(false);

  const theme = useTheme();

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
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      autoHideDuration={AUTO_HIDE_DURATION}
      onClose={handleClose}
      sx={{ bottom: 80 }}
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
