import { useEffect, useState } from "react";
import { Tab, Tabs } from "@material-ui/core";
import {
  ThumbsUpDown,
  ThumbUp,
  ThumbDown,
  PanTool,
  SvgIconComponent,
} from "@material-ui/icons";
import { CSSProperties } from "@material-ui/core/styles/withStyles";

import { useConsensusVotes, useUpDownVotes } from "../../hooks";
import Messages from "../../utils/messages";
import Modal from "../Shared/Modal";
import Voter from "./Voter";

interface TabLabelProps {
  icon: SvgIconComponent;
  votes: Vote[];
}

const TabLabel = ({ icon, votes }: TabLabelProps) => {
  const Icon = icon;

  return (
    <span>
      <Icon
        color="primary"
        fontSize="small"
        style={{ marginBottom: -5, marginRight: 7.5 }}
      />
      {votes.length}
    </span>
  );
};

interface Props {
  votes: Vote[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

const VotesModal = ({ votes, open, setOpen }: Props) => {
  const [agreements, standAsides, reservations, blocks] =
    useConsensusVotes(votes);
  const [upVotes, downVotes] = useUpDownVotes(votes);
  const thumbUpVotes = [...agreements, ...upVotes];
  const thumbDownVotes = [...standAsides, ...downVotes];
  const [tab, setTab] = useState<number>(0);

  useEffect(() => {
    if (open) setTab(0);
  }, [open]);

  const hideTab = (votes: Vote[]): CSSProperties | undefined => {
    if (votes.length) return undefined;
    return { display: "none" };
  };

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      appBarChildren={
        <Tabs
          value={tab}
          onChange={(_event: React.ChangeEvent<any>, newValue: number) =>
            setTab(newValue)
          }
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={Messages.labels.all()} />
          <Tab
            label={<TabLabel icon={ThumbUp} votes={thumbUpVotes} />}
            style={hideTab(thumbUpVotes)}
          />
          <Tab
            label={<TabLabel icon={ThumbDown} votes={thumbDownVotes} />}
            style={hideTab(thumbDownVotes)}
          />
          <Tab
            label={<TabLabel icon={ThumbsUpDown} votes={reservations} />}
            style={hideTab(reservations)}
          />
          <Tab
            label={<TabLabel icon={PanTool} votes={blocks} />}
            style={hideTab(blocks)}
          />
        </Tabs>
      }
      topGap
    >
      <>
        {tab === 0 &&
          votes.map((vote) => {
            return <Voter vote={vote} key={vote.id} />;
          })}

        {tab === 1 &&
          thumbUpVotes.map((vote) => {
            return <Voter vote={vote} key={vote.id} />;
          })}

        {tab === 2 &&
          thumbDownVotes.map((vote) => {
            return <Voter vote={vote} key={vote.id} />;
          })}

        {tab === 3 &&
          reservations.map((vote) => {
            return <Voter vote={vote} key={vote.id} />;
          })}

        {tab === 4 &&
          blocks.map((vote) => {
            return <Voter vote={vote} key={vote.id} />;
          })}
      </>
    </Modal>
  );
};

export default VotesModal;
