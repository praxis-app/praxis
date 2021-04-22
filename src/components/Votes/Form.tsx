import React from "react";
import { useState, ChangeEvent, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
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

import { CURRENT_USER } from "../../apollo/client/queries";
import { UPDATE_VOTE } from "../../apollo/client/mutations";
import styles from "../../styles/Vote/VotesForm.module.scss";

const color = { color: "rgb(170, 170, 170)" };
const useStyles = makeStyles((theme) => ({
  select: { ...color },
  textInput: { ...color },
}));

interface Props {
  vote: Vote;
  votes?: Vote[];
  setVotes?: (votes: Vote[]) => void;
}

const VotesForm = ({ vote, votes, setVotes }: Props) => {
  const [body, setBody] = useState<string>("");
  const [flipState, setFlipState] = useState<string>();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const [updateVote] = useMutation(UPDATE_VOTE);
  const currentUserRes = useQuery(CURRENT_USER);
  const classes = useStyles();

  useEffect(() => {
    setBody(vote.body);
    setFlipState(vote.flipState);
  }, [vote]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (currentUserRes.data) {
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
        if (setVotes && votes)
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
        else Router.push(`/motions/${vote.motionId}`);
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
    if (submitLoading) return "Loading...";
    return flipState === "up"
      ? "Why do you support this motion? (optional)"
      : "Why are you blocking this motion? (optional)";
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className={styles.form}>
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
            Motion type
          </InputLabel>
          <NativeSelect
            value={flipState}
            onChange={handleFlipStateChange}
            classes={{
              select: classes.select,
            }}
          >
            <option aria-label="None" value="" />
            <option value={"up"}>Support</option>
            <option value={"down"}>Block</option>
          </NativeSelect>
        </FormControl>
      </FormGroup>

      <Button
        variant="contained"
        type="submit"
        style={{ color: "white", backgroundColor: "rgb(65, 65, 65)" }}
      >
        Update vote
      </Button>
    </form>
  );
};

export default VotesForm;
