import React from "react";
import { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { EmojiPeople, PostAdd } from "@material-ui/icons";
import { makeStyles, withStyles } from "@material-ui/core";

import PostsForm from "../../components/Posts/Form";
import MotionsForm from "../../components/Motions/Form";
import styles from "../../styles/Group/ToggleForms.module.scss";

const useStyles = makeStyles({
  selected: {
    backgroundColor: "red",
  },
});

const StyledToggleButtonGroup = withStyles(() => ({
  grouped: {
    border: "none",
    boxShadow:
      "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
  },
}))(ToggleButtonGroup);

interface Props {
  posts: Post[];
  motions: Motion[];
  setPosts: (posts: Post[]) => void;
  setMotions: (motions: Motion[]) => void;
  group: Group;
}

const ToggleForms = ({
  posts,
  motions,
  setMotions,
  setPosts,
  group,
}: Props) => {
  const [toggle, setToggle] = useState<string>("post");
  const classes = useStyles();

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
          style={{ background: "rgb(65, 65, 65)", float: "right" }}
        >
          <ToggleButton value="post" color="secondary">
            <PostAdd style={toggle === "post" ? { color: "white" } : {}} />
          </ToggleButton>
          <ToggleButton value="motion" classes={{ selected: classes.selected }}>
            <EmojiPeople
              style={toggle === "motion" ? { color: "white" } : {}}
            />
          </ToggleButton>
        </StyledToggleButtonGroup>
      </div>

      {toggle === "post" && (
        <PostsForm posts={posts} setPosts={setPosts} group={group} />
      )}
      {toggle === "motion" && (
        <MotionsForm motions={motions} setMotions={setMotions} group={group} />
      )}
    </>
  );
};

export default ToggleForms;
