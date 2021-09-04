import {
  withStyles,
  createStyles,
  Button as MUIButton,
} from "@material-ui/core";

import { BLURPLE_BUTTON_COLORS } from "../../styles/Shared/theme";
import Messages from "../../utils/messages";
import { modalOpenVar } from "../../apollo/client/localState";
import { ModelNames } from "../../constants/common";

const Button = withStyles(() =>
  createStyles({
    root: {
      width: 160,
      height: 50,
      fontFamily: "Inter Bold",
      fontSize: 18,
      letterSpacing: "0.2px",
      textTransform: "none",
      marginTop: 10,

      ...BLURPLE_BUTTON_COLORS,
    },
  })
)(MUIButton);

const MotionButton = () => {
  return (
    <Button
      onClick={() => modalOpenVar(ModelNames.Motion)}
      variant="contained"
      color="primary"
    >
      {Messages.motions.actions.motion()}
    </Button>
  );
};

export default MotionButton;
