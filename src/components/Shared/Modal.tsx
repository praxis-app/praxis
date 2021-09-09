import {
  Button,
  makeStyles,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Theme,
  createStyles,
  withStyles,
  Container as MUIContainer,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { CircularProgress, Fade } from "@material-ui/core";

import { useIsMobile } from "../../hooks";
import { BLURPLE } from "../../styles/Shared/theme";

const Container = withStyles(() =>
  createStyles({
    root: {
      marginTop: 10,
      marginBottom: 40,
      minHeight: 200,
    },
  })
)(MUIContainer);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    titleWithCaption: {
      flex: 1,
    },
    appBar: {
      position: "relative",
      backgroundColor: theme.palette.background.paper,
      marginBottom: 40,
    },
  })
);

interface Props {
  title?: string;
  subtext?: string;
  actionLabel?: string;
  onClose: () => void;
  closingAction?: (_: any) => any;
  appBarChildren?: React.ReactChild;
  children: React.ReactChild;
  loading?: boolean;
  appBar?: boolean;
  topGap?: boolean;
  open: boolean;
}

const Modal = ({
  title,
  subtext,
  onClose,
  actionLabel,
  closingAction,
  appBarChildren,
  children,
  loading,
  appBar,
  topGap,
  open,
}: Props) => {
  const isMobile = useIsMobile();
  const classes = useStyles();

  const handleCloseDialog = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Fade}
      onClose={handleCloseDialog}
      fullScreen={isMobile}
      fullWidth
      style={topGap && isMobile ? { marginTop: "20vh" } : {}}
    >
      {(appBar || appBarChildren) && (
        <AppBar className={classes.appBar}>
          {appBarChildren ? (
            appBarChildren
          ) : (
            <Toolbar style={{ backgroundColor: BLURPLE }}>
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
                <Typography variant="caption" color="primary">
                  {subtext}
                </Typography>
              </div>
              {actionLabel && closingAction && !loading && (
                <Button color="inherit" onClick={closingAction}>
                  {actionLabel}
                </Button>
              )}
              {loading && <CircularProgress />}
            </Toolbar>
          )}
        </AppBar>
      )}

      <Container maxWidth="md">{children}</Container>
    </Dialog>
  );
};

export default Modal;
