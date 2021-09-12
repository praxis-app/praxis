import { useMutation, useReactiveVar } from "@apollo/client";
import { Menu, MenuItem, PopoverOrigin, SvgIconProps } from "@material-ui/core";
import { ThumbUp, ThumbDown, PanTool, ThumbsUpDown } from "@material-ui/icons";

import { Stages } from "../../constants/motion";
import { BLURPLE, WHITE } from "../../styles/Shared/theme";
import { feedVar, motionVar, toastVar } from "../../apollo/client/localState";
import { CREATE_VOTE, DELETE_VOTE } from "../../apollo/client/mutations";
import { ConsensusStates } from "../../constants/vote";
import { useCurrentUser } from "../../hooks";
import Messages from "../../utils/messages";
import { ToastStatus, TypeNames } from "../../constants/common";

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
    if (consensusState === ConsensusStates.Agreement)
      return (
        <>
          <ThumbUp {...iconProps} />
          <span style={{ color }}>{Messages.votes.actions.agree()}</span>
        </>
      );
    if (consensusState === ConsensusStates.Reservations)
      return (
        <>
          <ThumbsUpDown {...iconProps} />
          <span style={{ color }}>{Messages.votes.actions.reservations()}</span>
        </>
      );
    if (consensusState === ConsensusStates.StandAside)
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
  votes: ClientVote[];
  setVotes: (votes: ClientVote[]) => void;
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
  const feed = useReactiveVar(feedVar);
  const motionFromGlobal = useReactiveVar(motionVar);
  const [createVote] = useMutation(CREATE_VOTE);
  const [deleteVote] = useMutation(DELETE_VOTE);
  const popoverOrigin: PopoverOrigin = {
    vertical: "top",
    horizontal: "center",
  };

  const alreadyVote = (): ClientVote | null => {
    if (!currentUser) return null;
    const vote = votes.find((vote) => vote.userId === currentUser.id);
    if (vote) return vote;
    return null;
  };

  const alreadyAgree = (): ClientVote | null => {
    if (alreadyVote()?.consensusState === ConsensusStates.Agreement)
      return alreadyVote();
    return null;
  };

  const alreadyDeclaredReservations = (): ClientVote | null => {
    if (alreadyVote()?.consensusState === ConsensusStates.Reservations)
      return alreadyVote();
    return null;
  };

  const alreadyDelcaredStandAside = (): ClientVote | null => {
    if (alreadyVote()?.consensusState === ConsensusStates.StandAside)
      return alreadyVote();
    return null;
  };

  const alreadyBlocked = (): ClientVote | null => {
    if (alreadyVote()?.consensusState === ConsensusStates.Block)
      return alreadyVote();
    return null;
  };

  const menuItemColor = (consensusState: string): string => {
    if (
      (consensusState === ConsensusStates.Agreement && alreadyAgree()) ||
      (consensusState === ConsensusStates.Reservations &&
        alreadyDeclaredReservations()) ||
      (consensusState === ConsensusStates.StandAside &&
        alreadyDelcaredStandAside()) ||
      (consensusState === ConsensusStates.Block && alreadyBlocked())
    )
      return BLURPLE;
    return WHITE;
  };

  const handleMenuItemClick = async (consensusState: string) => {
    handleClose();

    let newVotes: ClientVote[] = votes;
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
      if (data.createVote.motionRatified) {
        toastVar({
          title: Messages.motions.toasts.ratifiedSuccess(),
          status: ToastStatus.Success,
        });

        if (motionFromGlobal)
          motionVar({ ...motionFromGlobal, stage: Stages.Ratified });

        if (feed.totalItems)
          feedVar({
            ...feed,
            items: feed.items.map((item) => {
              if (item.id === motionId && item.__typename === TypeNames.Motion)
                return { ...item, stage: Stages.Ratified };
              return item;
            }),
          });
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
          consensusState={ConsensusStates.Agreement}
          color={menuItemColor(ConsensusStates.Agreement)}
        />
        <ConsensusMenuItem
          handleClick={handleMenuItemClick}
          consensusState={ConsensusStates.StandAside}
          color={menuItemColor(ConsensusStates.StandAside)}
        />
        <ConsensusMenuItem
          handleClick={handleMenuItemClick}
          consensusState={ConsensusStates.Reservations}
          color={menuItemColor(ConsensusStates.Reservations)}
        />
        <ConsensusMenuItem
          handleClick={handleMenuItemClick}
          consensusState={ConsensusStates.Block}
          color={menuItemColor(ConsensusStates.Block)}
        />
      </div>
    </Menu>
  );
};

export default ConsensusMenu;
