import { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { EmojiPeople, PostAdd } from "@material-ui/icons";
import { withStyles } from "@material-ui/core";

import PostsForm from "../../components/Posts/Form";
import MotionsForm from "../../components/Motions/Form";
import styles from "../../styles/Group/ToggleForms.module.scss";
import { Common } from "../../constants";

const StyledToggleButtonGroup = withStyles(() => ({
  root: {
    background: "rgb(65, 65, 65)",
    float: "right",
  },
  grouped: {
    border: "none",
    boxShadow:
      "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
  },
}))(ToggleButtonGroup);

interface Props {
  group: Group;
}

const ToggleForms = ({ group }: Props) => {
  const [toggle, setToggle] = useState<string>(Common.ModelNames.Post);

  const handleToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newToggle: string
  ) => {
    if (newToggle) setToggle(newToggle);
  };

  return (
    <>
      <div className={styles.toggleContainer}>
        <StyledToggleButtonGroup
          value={toggle}
          exclusive
          size="small"
          onChange={handleToggle}
        >
          <ToggleButton value={Common.ModelNames.Post} color="secondary">
            <PostAdd
              style={
                toggle === Common.ModelNames.Post ? { color: "white" } : {}
              }
            />
          </ToggleButton>
          <ToggleButton value={Common.ModelNames.Motion}>
            <EmojiPeople
              style={
                toggle === Common.ModelNames.Motion ? { color: "white" } : {}
              }
            />
          </ToggleButton>
        </StyledToggleButtonGroup>
      </div>

      {toggle === Common.ModelNames.Post && <PostsForm group={group} />}
      {toggle === Common.ModelNames.Motion && <MotionsForm group={group} />}
    </>
  );
};

export default ToggleForms;
