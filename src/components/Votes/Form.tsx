import React from "react";
import { useState, ChangeEvent, useEffect } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import Router from "next/router";
import {
  FormGroup,
  FormControl,
  InputLabel,
  NativeSelect,
} from "@material-ui/core";

import { motionVar } from "../../apollo/client/localState";
import { UPDATE_VOTE } from "../../apollo/client/mutations";
import styles from "../../styles/Vote/VotesForm.module.scss";
import { Motions, Votes } from "../../constants";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import SubmitButton from "../Shared/SubmitButton";
import TextInput from "../Shared/TextInput";

interface Props {
  vote: Vote;
  votes?: Vote[];
  setVotes?: (votes: Vote[]) => void;
  onEditPage?: boolean;
  modelOfConsensus?: boolean;
}

const VotesForm = ({
  vote,
  votes,
  setVotes,
  onEditPage,
  modelOfConsensus,
}: Props) => {
  const currentUser = useCurrentUser();
  const motionFromGlobal = useReactiveVar(motionVar);
  const [body, setBody] = useState<string>("");
  const [flipState, setFlipState] = useState<string>("");
  const [consensusState, setConsensusState] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [updateVote] = useMutation(UPDATE_VOTE);

  useEffect(() => {
    setBody(vote.body);
    if (modelOfConsensus) setConsensusState(vote.consensusState);
    else setFlipState(vote.flipState);
  }, [vote, modelOfConsensus]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (currentUser) {
      setSubmitLoading(true);
      try {
        setBody("");
        setFlipState("");
        setConsensusState("");
        const { data } = await updateVote({
          variables: {
            id: vote?.id,
            consensusState,
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
                  consensusState: newVote.consensusState,
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

  const handleVoteTypeChange = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    if (modelOfConsensus) setConsensusState(event.target.value);
    else setFlipState(event.target.value);
  };

  const placeholderText = () => {
    if (submitLoading) return Messages.states.loading();

    if (modelOfConsensus) {
      if (consensusState === Votes.ConsensusStates.Agreement)
        return Messages.votes.form.bodyPlaceholder.agreement();
      if (consensusState === Votes.ConsensusStates.Reservations)
        return Messages.votes.form.bodyPlaceholder.reservations();
      if (consensusState === Votes.ConsensusStates.StandAside)
        return Messages.votes.form.bodyPlaceholder.standAside();
      if (consensusState === Votes.ConsensusStates.Block)
        return Messages.votes.form.bodyPlaceholder.block();
    }

    return flipState === Votes.FlipStates.Up
      ? Messages.votes.form.bodyPlaceholder.support()
      : Messages.votes.form.bodyPlaceholder.block();
  };

  const selectValue = (): string => {
    if (modelOfConsensus && consensusState) return consensusState;
    else if (flipState) return flipState;
    return "";
  };

  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      className={onEditPage ? styles.formOnEditPage : styles.form}
    >
      <FormGroup>
        <TextInput
          placeholder={placeholderText()}
          value={body ? body : ""}
          multiline
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setBody(e.target.value)
          }
        />

        <FormControl style={{ marginBottom: "20px" }}>
          <InputLabel>
            {modelOfConsensus
              ? Messages.votes.form.agreeOrDisagree()
              : Messages.votes.form.supportOrBlock()}
          </InputLabel>
          <NativeSelect value={selectValue()} onChange={handleVoteTypeChange}>
            <option aria-label={Messages.forms.none()} value="" />
            {modelOfConsensus ? (
              <>
                <option value={Votes.ConsensusStates.Agreement}>
                  {Messages.votes.consensus.voteTypes.names.agreement()}
                </option>
                <option value={Votes.ConsensusStates.Reservations}>
                  {Messages.votes.consensus.voteTypes.names.reservations()}
                </option>
                <option value={Votes.ConsensusStates.StandAside}>
                  {Messages.votes.consensus.voteTypes.names.standAside()}
                </option>
                <option value={Votes.ConsensusStates.Block}>
                  {Messages.votes.consensus.voteTypes.names.block()}
                </option>
              </>
            ) : (
              <>
                <option value={Votes.FlipStates.Up}>
                  {Messages.votes.actions.support()}
                </option>
                <option value={Votes.FlipStates.Down}>
                  {Messages.votes.actions.block()}
                </option>
              </>
            )}
          </NativeSelect>
        </FormControl>
      </FormGroup>

      <SubmitButton>{Messages.votes.actions.update()}</SubmitButton>
    </form>
  );
};

export default VotesForm;
