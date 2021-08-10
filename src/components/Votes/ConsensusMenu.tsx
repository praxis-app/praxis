import { useMutation, useReactiveVar } from "@apollo/client";
import { Menu, MenuItem, PopoverOrigin, SvgIconProps } from "@material-ui/core";
import { ThumbUp, ThumbDown, PanTool, ThumbsUpDown } from "@material-ui/icons";

import { Motions, Votes } from "../../constants";
import { BLURPLE, WHITE } from "../../styles/Shared/theme";
import { motionVar } from "../../apollo/client/localState";
import { CREATE_VOTE, DELETE_VOTE } from "../../apollo/client/mutations";
import { useCurrentUser } from "../../hooks";
import Messages from "../../utils/messages";

interface ConsensusMenuItemProps {
  consensusState: string;
  handleClick: (consensusState: string) => void;
  color: string;
}

const ConsensusMenuItem = ({
  consensusState,
  handleClick,
  color,
}: ConsensusMenuItemProps) => {
  const IconWithText = (iconProps: SvgIconProps) => {
    if (consensusState === Votes.ConsensusStates.Agreement)
      return (
        <>
          <ThumbUp {...iconProps} />
          <span style={{ color }}>{Messages.votes.actions.agree()}</span>
        </>
      );
    if (consensusState === Votes.ConsensusStates.Reservations)
      return (
        <>
          <ThumbsUpDown {...iconProps} />
          <span style={{ color }}>{Messages.votes.actions.reservations()}</span>
        </>
      );
    if (consensusState === Votes.ConsensusStates.StandAside)
      return (
        <>
          <ThumbDown {...iconProps} />
          <span style={{ color }}>{Messages.votes.actions.standAside()}</span>
        </>
      );
    return (
      <>
        <PanTool {...iconProps} />
        <span style={{ color }}>{Messages.votes.actions.block()}</span>
      </>
    );
  };

  return (
    <MenuItem onClick={() => handleClick(consensusState)}>
      <IconWithText
        style={{
          color,
          marginRight: 7.5,
        }}
        fontSize="small"
      />
    </MenuItem>
  );
};

interface ConsensusMenuProps {
  motionId: string;
  votes: Vote[];
  setVotes: (votes: Vote[]) => void;
  anchorEl: null | HTMLElement;
  handleClose: () => void;
}

const ConsensusMenu = ({
  motionId,
  votes,
  setVotes,
  anchorEl,
  handleClose,
}: ConsensusMenuProps) => {
  const currentUser = useCurrentUser();
  const motionFromGlobal = useReactiveVar(motionVar);
  const [createVote] = useMutation(CREATE_VOTE);
  const [deleteVote] = useMutation(DELETE_VOTE);
  const popoverOrigin: PopoverOrigin = {
    vertical: "top",
    horizontal: "center",
  };

  const alreadyVote = (): Vote | null => {
    if (!currentUser) return null;
    const vote = votes.find((vote) => vote.userId === currentUser.id);
    if (vote) return vote;
    return null;
  };

  const alreadyAgree = (): Vote | null => {
    if (alreadyVote()?.consensusState === Votes.ConsensusStates.Agreement)
      return alreadyVote();
    return null;
  };

  const alreadyDeclaredReservations = (): Vote | null => {
    if (alreadyVote()?.consensusState === Votes.ConsensusStates.Reservations)
      return alreadyVote();
    return null;
  };

  const alreadyDelcaredStandAside = (): Vote | null => {
    if (alreadyVote()?.consensusState === Votes.ConsensusStates.StandAside)
      return alreadyVote();
    return null;
  };

  const alreadyBlocked = (): Vote | null => {
    if (alreadyVote()?.consensusState === Votes.ConsensusStates.Block)
      return alreadyVote();
    return null;
  };

  const menuItemColor = (consensusState: string): string => {
    if (
      (consensusState === Votes.ConsensusStates.Agreement && alreadyAgree()) ||
      (consensusState === Votes.ConsensusStates.Reservations &&
        alreadyDeclaredReservations()) ||
      (consensusState === Votes.ConsensusStates.StandAside &&
        alreadyDelcaredStandAside()) ||
      (consensusState === Votes.ConsensusStates.Block && alreadyBlocked())
    )
      return BLURPLE;
    return WHITE;
  };

  const handleMenuItemClick = async (consensusState: string) => {
    handleClose();

    let newVotes: Vote[] = votes;
    if (alreadyVote()) {
      await deleteVote({
        variables: {
          id: alreadyVote()?.id,
        },
      });
      newVotes = newVotes.filter((vote) => vote.userId !== currentUser?.id);
    }
    if (
      (alreadyVote() && alreadyVote()?.consensusState !== consensusState) ||
      !alreadyVote()
    ) {
      const { data } = await createVote({
        variables: {
          userId: currentUser?.id,
          motionId,
          consensusState,
        },
      });
      newVotes = [...newVotes, data.createVote.vote];
      if (data.createVote.motionRatified && motionFromGlobal) {
        motionVar({ ...motionFromGlobal, stage: Motions.Stages.Ratified });
      }
    }
    setVotes(newVotes);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      keepMounted
      getContentAnchorEl={null}
      anchorOrigin={popoverOrigin}
      transformOrigin={popoverOrigin}
    >
      <div>
        <ConsensusMenuItem
          handleClick={handleMenuItemClick}
          consensusState={Votes.ConsensusStates.Agreement}
          color={menuItemColor(Votes.ConsensusStates.Agreement)}
        />
        <ConsensusMenuItem
          handleClick={handleMenuItemClick}
          consensusState={Votes.ConsensusStates.StandAside}
          color={menuItemColor(Votes.ConsensusStates.StandAside)}
        />
        <ConsensusMenuItem
          handleClick={handleMenuItemClick}
          consensusState={Votes.ConsensusStates.Reservations}
          color={menuItemColor(Votes.ConsensusStates.Reservations)}
        />
        <ConsensusMenuItem
          handleClick={handleMenuItemClick}
          consensusState={Votes.ConsensusStates.Block}
          color={menuItemColor(Votes.ConsensusStates.Block)}
        />
      </div>
    </Menu>
  );
};

export default ConsensusMenu;
