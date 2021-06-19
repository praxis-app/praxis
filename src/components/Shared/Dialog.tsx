import { forwardRef } from "react";
import {
  Button,
  makeStyles,
  Slide,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { TransitionProps } from "@material-ui/core/transitions";
import { CircularProgress } from "@material-ui/core";

const useStyles = makeStyles({
  titleWithCaption: {
    flex: 1,
  },
  appBar: {
    position: "relative",
    backgroundColor: "rgb(30, 30, 30)",
    marginBottom: 40,
  },
});

const DialogTransition = forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
  title: string;
  subtext?: string;
  actionLabel?: string;
  closingAction?: (_: any) => any;
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactChild;
  loading?: boolean;
}

const CommonDialog = ({
  title,
  subtext,
  open,
  setOpen,
  actionLabel,
  closingAction,
  children,
  loading,
}: Props) => {
  const classes = useStyles();

  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={DialogTransition}
      onClose={handleCloseDialog}
      PaperProps={{
        style: {
          backgroundColor: "rgb(50, 50, 50)",
        },
      }}
      fullScreen
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton color="inherit" onClick={handleCloseDialog}>
            <Close />
          </IconButton>
          <div className={classes.titleWithCaption}>
            <Typography
              variant="h6"
              style={subtext ? { marginTop: 5, marginBottom: -10 } : {}}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              style={{ color: "rgb(150, 150, 150)" }}
            >
              {subtext}
            </Typography>
          </div>
          {actionLabel && closingAction && !loading && (
            <Button color="inherit" onClick={closingAction}>
              {actionLabel}
            </Button>
          )}
          {loading && <CircularProgress style={{ color: "white" }} />}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md">{children}</Container>
    </Dialog>
  );
};

export default CommonDialog;
