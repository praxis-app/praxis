import { useReactiveVar } from "@apollo/client";
import {
  ToggleButton,
  ToggleButtonGroup as MUIToggleButtonGroup,
} from "@material-ui/lab";
import { EmojiPeople, PostAdd } from "@material-ui/icons";
import { Theme, withStyles } from "@material-ui/core";

import { WHITE } from "../../styles/Shared/theme";
import { FormToggleState, ModelNames } from "../../constants/common";
import { formToggleVar } from "../../apollo/client/localState";

const ToggleButtonGroup = withStyles((theme: Theme) => ({
  root: {
    background: theme.palette.secondary.main,
    height: 32,
    marginTop: 4,
    marginLeft: 12,
  },
  grouped: {
    border: "none",
  },
}))(MUIToggleButtonGroup);

const FormToggle = () => {
  const toggle = useReactiveVar(formToggleVar);

  const handleToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newToggle: FormToggleState
  ) => {
    if (newToggle) formToggleVar(newToggle);
  };

  return (
    <ToggleButtonGroup
      value={toggle}
      exclusive
      size="small"
      onChange={handleToggle}
    >
      <ToggleButton value={ModelNames.Post} color="secondary">
        <PostAdd style={toggle === ModelNames.Post ? { color: WHITE } : {}} />
      </ToggleButton>
      <ToggleButton value={ModelNames.Motion}>
        <EmojiPeople
          style={toggle === ModelNames.Motion ? { color: WHITE } : {}}
        />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default FormToggle;
