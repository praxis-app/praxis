import { useEffect, useState } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import { useReactiveVar } from "@apollo/client";

import { toastVar } from "../../apollo/client/localState";
import { Events, KeyCodes } from "../../constants/common";

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

const AUTO_HIDE_DURATION = 6000;

const Toast = () => {
  const toastNotification = useReactiveVar(toastVar);
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    if (toastNotification) setOpen(true);
  }, [toastNotification]);

  // TODO: Create global keyboard listener that updates global state,
  // which Toast, along with other components, can all respond to.
  // Will be necessary for accessibility features.
  useEffect(() => {
    document.addEventListener(Events.Keydown, handleKeyDown);
    return () => {
      document.removeEventListener(Events.Keydown, handleKeyDown);
      toastVar(null);
      setOpen(false);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === KeyCodes.Escape) setOpen(false);
  };

  return (
    <div className={classes.root}>
      <Snackbar
        open={open}
        autoHideDuration={AUTO_HIDE_DURATION}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={toastNotification?.status}>
          {toastNotification?.title}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Toast;
