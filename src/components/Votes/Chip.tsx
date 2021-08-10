// TODO: Come up with a better name for this component that doesn't conflict with MUIs Chip component

import { useState } from "react";
import {
  Typography,
  Popover,
  makeStyles,
  Theme,
  createStyles,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import { SvgIconComponent } from "@material-ui/icons";

import styles from "../../styles/Vote/Chips.module.scss";
import { Common } from "../../constants";
import Messages from "../../utils/messages";
import { ConsensusStates } from "../../hooks";
import Voter from "./Voter";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    popover: {
      pointerEvents: "none",
    },
    paper: {
      padding: theme.spacing(1),
      maxWidth: 520,
    },
  })
);

export interface ChipProps {
  icon: SvgIconComponent;
  voteState: string;
  votes: Vote[];
  zIndex: number;
  marginLeft: number;
}

const VoteChip = ({
  icon,
  voteState,
  votes,
  zIndex,
  marginLeft,
}: ChipProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const popoverOpen = Boolean(anchorEl);
  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(
    theme.breakpoints.up(Common.DESKTOP_BREAKPOINT)
  );
  const SvgIcon = icon;

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const voterType = (): string => {
    switch (voteState) {
      case ConsensusStates.Agreement:
        return Messages.votes.consensus.voteTypes.names.agreement();
      case ConsensusStates.StandAside:
        return Messages.votes.consensus.voteTypes.names.standAside();
      case ConsensusStates.Reservations:
        return Messages.votes.consensus.voteTypes.names.reservations();
      case ConsensusStates.Block:
        return Messages.votes.consensus.voteTypes.names.block();
      default:
        return "";
    }
  };

  return (
    <>
      <span
        className={styles.voteChip}
        style={{ zIndex }}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        aria-haspopup="true"
      >
        <SvgIcon
          color="primary"
          style={{
            marginLeft,
            fontSize: 13,
          }}
        />
      </span>

      {isDesktop && (
        <Popover
          className={classes.popover}
          classes={{
            paper: classes.paper,
          }}
          open={popoverOpen}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <Typography color="primary" style={{ marginBottom: 6, fontSize: 17 }}>
            {voterType()}
          </Typography>

          {popoverOpen &&
            votes.map((vote) => {
              return <Voter vote={vote} key={vote.id} compact />;
            })}
        </Popover>
      )}
    </>
  );
};

export default VoteChip;
