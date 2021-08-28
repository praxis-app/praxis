import { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { EmojiPeople, PostAdd } from "@material-ui/icons";
import { withStyles } from "@material-ui/core";

import PostsForm from "../../components/Posts/Form";
import MotionsFormWithCard from "../Motions/FormWithCard";
import styles from "../../styles/Group/ToggleForms.module.scss";
import { WHITE } from "../../styles/Shared/theme";
import { ModelNames } from "../../constants/common";

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
  const [toggle, setToggle] = useState<string>(ModelNames.Post);

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
          <ToggleButton value={ModelNames.Post} color="secondary">
            <PostAdd
              style={toggle === ModelNames.Post ? { color: WHITE } : {}}
            />
          </ToggleButton>
          <ToggleButton value={ModelNames.Motion}>
            <EmojiPeople
              style={toggle === ModelNames.Motion ? { color: WHITE } : {}}
            />
          </ToggleButton>
        </StyledToggleButtonGroup>
      </div>

      {toggle === ModelNames.Motion && <MotionsFormWithCard group={group} />}

      {toggle === ModelNames.Post && <PostsForm group={group} />}
    </>
  );
};

export default ToggleForms;
