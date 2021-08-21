import { useMutation, useReactiveVar } from "@apollo/client";
import { Menu, MenuItem, PopoverOrigin, SvgIconProps } from "@material-ui/core";
import { ThumbUp, ThumbDown } from "@material-ui/icons";

import { Stages } from "../../constants/motion";
import { motionVar } from "../../apollo/client/localState";
import { CREATE_VOTE, DELETE_VOTE } from "../../apollo/client/mutations";
import { useCurrentUser } from "../../hooks";
import { BLURPLE, WHITE } from "../../styles/Shared/theme";
import { FlipStates } from "../../constants/vote";
import Messages from "../../utils/messages";

interface VoteButtonProps {
  flipState: string;
  handleClick: (flipState: string) => void;
  color: string;
}

const VoteMenuItem = ({ flipState, handleClick, color }: VoteButtonProps) => {
  const IconWithText = (iconProps: SvgIconProps) =>
    flipState === FlipStates.Up ? (
      <>
        <ThumbUp {...iconProps} />
        <span style={{ color }}>{Messages.votes.actions.support()}</span>
      </>
    ) : (
      <>
        <ThumbDown {...iconProps} />
        <span style={{ color }}>{Messages.votes.actions.block()}</span>
      </>
    );
  return (
    <MenuItem onClick={() => handleClick(flipState)}>
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

interface VoteMenuProps {
  motionId: string;
  votes: Vote[];
  setVotes: (votes: Vote[]) => void;
  anchorEl: null | HTMLElement;
  handleClose: () => void;
}

const VoteMenu = ({
  motionId,
  votes,
  setVotes,
  anchorEl,
  handleClose,
}: VoteMenuProps) => {
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

  const alreadyUpVote = (): Vote | null => {
    if (alreadyVote()?.flipState === FlipStates.Up) return alreadyVote();
    return null;
  };

  const alreadyDownVote = (): Vote | null => {
    if (alreadyVote()?.flipState === FlipStates.Down) return alreadyVote();
    return null;
  };

  const menuItemColor = (flipState: string): string => {
    if (
      (flipState === FlipStates.Up && alreadyUpVote()) ||
      (flipState === FlipStates.Down && alreadyDownVote())
    )
      return BLURPLE;
    return WHITE;
  };

  const handleButtonClick = async (flipState: string) => {
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
      (alreadyVote() && alreadyVote()?.flipState !== flipState) ||
      !alreadyVote()
    ) {
      const { data } = await createVote({
        variables: {
          userId: currentUser?.id,
          motionId,
          flipState,
        },
      });
      newVotes = [...newVotes, data.createVote.vote];
      if (data.createVote.motionRatified && motionFromGlobal) {
        motionVar({ ...motionFromGlobal, stage: Stages.Ratified });
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
        <VoteMenuItem
          flipState={FlipStates.Up}
          handleClick={handleButtonClick}
          color={menuItemColor(FlipStates.Up)}
        />
        <VoteMenuItem
          flipState={FlipStates.Down}
          handleClick={handleButtonClick}
          color={menuItemColor(FlipStates.Down)}
        />
      </div>
    </Menu>
  );
};

export default VoteMenu;
