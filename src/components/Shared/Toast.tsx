import { useEffect, useState } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import { useReactiveVar } from "@apollo/client";

import { toastVar } from "../../apollo/client/localState";

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

const Toast = () => {
  const toastNotification = useReactiveVar(toastVar);
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    if (toastNotification) setOpen(true);
  }, [toastNotification]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={toastNotification?.status}>
          {toastNotification?.title}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Toast;
