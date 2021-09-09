import Link from "next/link";
import {
  Divider,
  LinearProgress,
  SvgIconProps,
  Typography,
} from "@material-ui/core";
import { ThumbUp, ThumbDown, ThumbsUpDown, PanTool } from "@material-ui/icons";
import { CSSProperties } from "@material-ui/core/styles/withStyles";

import { useUserById } from "../../hooks";
import styles from "../../styles/Vote/Voter.module.scss";
import UserAvatar from "../Users/Avatar";
import { ConsensusStates, FlipStates } from "../../constants/vote";

const BadgeContent = ({ vote }: { vote: ClientVote }) => {
  const style: CSSProperties = { fontSize: 8, marginTop: 1 };
  const iconProps: SvgIconProps = { color: "primary", style };

  if (vote.consensusState === ConsensusStates.Agreement)
    return <ThumbUp {...iconProps} />;
  if (vote.consensusState === ConsensusStates.StandAside)
    return <ThumbDown {...iconProps} />;
  if (vote.consensusState === ConsensusStates.Reservations)
    return <ThumbsUpDown {...iconProps} />;
  if (vote.consensusState === ConsensusStates.Block)
    return <PanTool {...iconProps} />;

  if (vote.flipState === FlipStates.Up) return <ThumbUp {...iconProps} />;
  if (vote.flipState === FlipStates.Down) return <ThumbDown {...iconProps} />;

  return null;
};

export interface Props {
  vote: ClientVote;
  compact?: boolean;
}

const Voter = ({ vote, compact }: Props) => {
  const user = useUserById(vote.userId);

  // TODO: Add check for time spent loading, only show loader after specified duration
  if (!user) return <LinearProgress />;

  if (compact)
    return (
      <Typography className={styles.voterCompact}>
        {user?.name}
        <span className={styles.voteBody}>
          {vote.body ? ` — ${vote.body}` : ""}
        </span>
      </Typography>
    );

  return (
    <>
      <div className={styles.voter}>
        <UserAvatar
          user={user}
          badge
          badgeContent={<BadgeContent vote={vote} />}
        />
        <Typography style={{ marginLeft: 18, marginTop: 8 }}>
          <Link href={`/users/${user.name}`}>
            <a>
              <span className={styles.voterName}>{user?.name}</span>
            </a>
          </Link>
          {vote.body ? ` — ${vote.body}` : ""}
        </Typography>
      </div>

      <Divider
        variant="middle"
        className={styles.divider}
        style={{
          marginBottom: 12,
          marginLeft: 58,
          width: "calc(100% - 58px)",
        }}
      />
    </>
  );
};

export default Voter;
