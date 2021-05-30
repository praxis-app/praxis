import React from "react";
import { useState, ChangeEvent, useEffect } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import Router from "next/router";
import {
  FormGroup,
  Input,
  Button,
  FormControl,
  InputLabel,
  NativeSelect,
  makeStyles,
} from "@material-ui/core";

import { motionVar } from "../../apollo/client/localState";
import { UPDATE_VOTE } from "../../apollo/client/mutations";
import styles from "../../styles/Vote/VotesForm.module.scss";
import { Motions, Votes } from "../../constants";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";

const color = { color: "rgb(170, 170, 170)" };
const useStyles = makeStyles(() => ({
  select: { ...color },
  textInput: { ...color },
}));

interface Props {
  vote: Vote;
  votes?: Vote[];
  setVotes?: (votes: Vote[]) => void;
  onEditPage?: boolean;
}

const VotesForm = ({ vote, votes, setVotes, onEditPage }: Props) => {
  const currentUser = useCurrentUser();
  const motionFromGlobal = useReactiveVar(motionVar);
  const [body, setBody] = useState<string>("");
  const [flipState, setFlipState] = useState<string>();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [updateVote] = useMutation(UPDATE_VOTE);
  const classes = useStyles();

  useEffect(() => {
    setBody(vote.body);
    setFlipState(vote.flipState);
  }, [vote]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (currentUser) {
      setSubmitLoading(true);
      try {
        setBody("");
        setFlipState(undefined);
        const { data } = await updateVote({
          variables: {
            id: vote?.id,
            flipState,
            body,
          },
        });
        if (setVotes && votes) {
          setVotes(
            votes.map((vote) => {
              const newVote: Vote = data.updateVote.vote;
              if (vote.id === newVote.id)
                return {
                  ...vote,
                  body: newVote.body,
                  flipState: newVote.flipState,
                };
              return vote;
            })
          );

          if (data.updateVote.motionRatified && motionFromGlobal) {
            motionVar({ ...motionFromGlobal, stage: Motions.Stages.Ratified });
          }
        } else {
          Router.push(`/motions/${vote.motionId}`);
        }
      } catch (err) {
        alert(err);
      }
    }
    setSubmitLoading(false);
  };

  const handleFlipStateChange = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    setFlipState(event.target.value);
  };

  const placeholderText = () => {
    if (submitLoading) return Messages.states.loading();
    return flipState === Votes.FlipStates.Up
      ? Messages.votes.form.bodyPlaceholder.support()
      : Messages.votes.form.bodyPlaceholder.block();
  };

  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      className={onEditPage ? styles.formOnEditPage : styles.form}
    >
      <FormGroup>
        <Input
          type="text"
          placeholder={placeholderText()}
          value={body ? body : ""}
          multiline
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setBody(e.target.value)
          }
          style={{
            marginBottom: "12px",
            color: "rgb(170, 170, 170)",
          }}
        />

        <FormControl style={{ marginBottom: "20px" }}>
          <InputLabel
            style={{ color: "rgb(105, 105, 105)", fontFamily: "Inter" }}
          >
            {Messages.votes.form.supportOrBlock()}
          </InputLabel>
          <NativeSelect
            value={flipState}
            onChange={handleFlipStateChange}
            classes={{
              select: classes.select,
            }}
          >
            <option aria-label="None" value="" />
            <option value={Votes.FlipStates.Up}>
              {Messages.votes.actions.support()}
            </option>
            <option value={Votes.FlipStates.Down}>
              {Messages.votes.actions.block()}
            </option>
          </NativeSelect>
        </FormControl>
      </FormGroup>

      <Button
        variant="contained"
        type="submit"
        style={{ color: "white", backgroundColor: "rgb(65, 65, 65)" }}
      >
        {Messages.votes.actions.update()}
      </Button>
    </form>
  );
};

export default VotesForm;
