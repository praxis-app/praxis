import { useState, useEffect } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import Router from "next/router";
import {
  FormGroup,
  FormControl,
  InputLabel,
  MenuItem,
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";

import { feedVar, motionVar } from "../../apollo/client/localState";
import { UPDATE_VOTE } from "../../apollo/client/mutations";
import styles from "../../styles/Vote/VotesForm.module.scss";
import Messages from "../../utils/messages";
import SubmitButton from "../Shared/SubmitButton";
import TextField from "../Shared/TextField";
import Dropdown from "../Shared/Dropdown";
import { Stages } from "../../constants/motion";
import { FieldNames, ResourcePaths, TypeNames } from "../../constants/common";
import { ConsensusStates, FlipStates } from "../../constants/vote";

interface FormValues {
  body: string;
}

interface Props {
  vote: ClientVote;
  votes?: ClientVote[];
  setVotes?: (votes: ClientVote[]) => void;
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
  const feed = useReactiveVar(feedVar);
  const motionFromGlobal = useReactiveVar(motionVar);
  const [flipState, setFlipState] = useState<string>("");
  const [consensusState, setConsensusState] = useState<string>("");
  const [updateVote] = useMutation(UPDATE_VOTE);
  const body = vote.body || "";

  useEffect(() => {
    if (modelOfConsensus) setConsensusState(vote.consensusState);
    else setFlipState(vote.flipState);
  }, [vote, modelOfConsensus]);

  const handleSubmit = async ({ body }: FormValues) => {
    try {
      const { data } = await updateVote({
        variables: {
          id: vote?.id,
          consensusState,
          flipState,
          body,
        },
      });
      if (setVotes && votes) {
        if (data.updateVote.motionRatified) {
          if (motionFromGlobal)
            motionVar({ ...motionFromGlobal, stage: Stages.Ratified });
          if (feed.totalItems)
            feedVar({
              ...feed,
              items: feed.items.map((item) => {
                if (
                  item.id === vote.motionId &&
                  item.__typename === TypeNames.Motion
                )
                  return { ...item, stage: Stages.Ratified };
                return item;
              }),
            });
        }

        setVotes(
          votes.map((vote) => {
            const newVote: ClientVote = data.updateVote.vote;
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
      } else {
        Router.push(`${ResourcePaths.Motion}${vote.motionId}`);
      }
    } catch (err) {
      alert(err);
    }
  };

  const handleVoteTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const { value } = event.target as { value: string };
    if (modelOfConsensus) setConsensusState(value);
    else setFlipState(value);
  };

  const placeholderText = () => {
    if (modelOfConsensus) {
      if (consensusState === ConsensusStates.Agreement)
        return Messages.votes.form.bodyPlaceholder.agreement();
      if (consensusState === ConsensusStates.Reservations)
        return Messages.votes.form.bodyPlaceholder.reservations();
      if (consensusState === ConsensusStates.StandAside)
        return Messages.votes.form.bodyPlaceholder.standAside();
      if (consensusState === ConsensusStates.Block)
        return Messages.votes.form.bodyPlaceholder.block();
    }

    return flipState === FlipStates.Up
      ? Messages.votes.form.bodyPlaceholder.agreement()
      : Messages.votes.form.bodyPlaceholder.disagreement();
  };

  const selectValue = (): string => {
    if (modelOfConsensus && consensusState) return consensusState;
    else if (flipState) return flipState;
    return "";
  };

  return (
    <Formik initialValues={{ body }} onSubmit={handleSubmit}>
      {(formik) => (
        <Form className={!onEditPage ? styles.form : ""}>
          <FormGroup>
            <Field
              name={FieldNames.Body}
              placeholder={placeholderText()}
              component={TextField}
              autoComplete="off"
              multiline
            />

            <FormControl style={{ marginBottom: 20 }}>
              <InputLabel>{Messages.votes.form.agreeOrDisagree()}</InputLabel>
              {modelOfConsensus ? (
                <Dropdown value={selectValue()} onChange={handleVoteTypeChange}>
                  <MenuItem value={ConsensusStates.Agreement}>
                    {Messages.votes.consensus.voteTypes.names.agreement()}
                  </MenuItem>
                  <MenuItem value={ConsensusStates.Reservations}>
                    {Messages.votes.consensus.voteTypes.names.reservations()}
                  </MenuItem>
                  <MenuItem value={ConsensusStates.StandAside}>
                    {Messages.votes.consensus.voteTypes.names.standAside()}
                  </MenuItem>
                  <MenuItem value={ConsensusStates.Block}>
                    {Messages.votes.consensus.voteTypes.names.block()}
                  </MenuItem>
                </Dropdown>
              ) : (
                <Dropdown value={selectValue()} onChange={handleVoteTypeChange}>
                  <MenuItem value={FlipStates.Up}>
                    {Messages.votes.actions.agree()}
                  </MenuItem>
                  <MenuItem value={FlipStates.Down}>
                    {Messages.votes.actions.disagree()}
                  </MenuItem>
                </Dropdown>
              )}
            </FormControl>
          </FormGroup>

          <div className={styles.flexEnd}>
            <SubmitButton disabled={formik.isSubmitting}>
              {Messages.votes.actions.update()}
            </SubmitButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default VotesForm;
