import Link from "next/link";
import { createStyles, makeStyles, Typography } from "@material-ui/core";
import {
  Language as WebIcon,
  Room as LocationIcon,
  WatchLater as ClockIcon,
  EmojiPeople as MotionIcon,
  Person as HostIcon,
} from "@material-ui/icons";
import Image from "material-ui-image";
import clsx from "clsx";

import {
  baseUrl,
  displayEventDuration,
  displayEventTime,
} from "../../utils/clientIndex";
import Messages from "../../utils/messages";
import ExternalLink from "../Shared/ExternalLink";
import muiTheme, { BLURPLE } from "../../styles/Shared/theme";
import { ResourcePaths } from "../../constants/common";
import { useRouter } from "next/router";
import UserName from "../Users/Name";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      marginTop: 18,
      marginBottom: 12,
    },
    inFormRoot: {
      marginBottom: 30,
    },
    iconRoot: {
      marginBottom: -4,
      marginRight: 8,
    },
    typographyRoot: {
      marginBottom: 6,
    },
    coverPhotoWrapper: {
      minWidth: 80,
      height: 80,
      marginRight: 12,
    },
    row: {
      display: "flex",
      marginBottom: 12,
    },
  })
);

interface Props {
  event: EventMotionInput;
  motionId?: string;
  inForm?: boolean;
}

const EventMotionDetails = ({ event, motionId, inForm }: Props) => {
  const {
    name,
    description,
    location,
    startsAt,
    endsAt,
    online,
    externalLink,
    coverPhoto,
    coverPhotoPath,
    hosts,
  } = event;
  const classes = useStyles();
  const { asPath } = useRouter();
  const href =
    motionId && !inForm ? `${ResourcePaths.Motion}${motionId}` : asPath;

  return (
    <div
      className={clsx(classes.root, {
        [classes.inFormRoot]: inForm,
      })}
    >
      <Link href={href}>
        <a className={classes.row}>
          {(coverPhoto || coverPhotoPath) && (
            <div className={classes.coverPhotoWrapper}>
              <Image
                src={
                  inForm
                    ? URL.createObjectURL(coverPhoto)
                    : baseUrl + coverPhotoPath
                }
                color={muiTheme.palette.background.paper}
                imageStyle={{ borderRadius: 8 }}
                disableSpinner
                disableError
                cover
              />
            </div>
          )}

          <div>
            <Typography variant="overline">
              {displayEventTime(startsAt, endsAt)}
            </Typography>

            <Typography
              variant="h6"
              color="primary"
              style={{ marginBottom: 0 }}
            >
              {name}
            </Typography>

            <Typography>{description}</Typography>
          </div>
        </a>
      </Link>

      {online && externalLink && (
        <Typography className={classes.typographyRoot}>
          <WebIcon fontSize="small" className={classes.iconRoot} />
          {Messages.events.online.online() + ": "}
          <ExternalLink href={externalLink} newTab>
            {externalLink}
          </ExternalLink>
        </Typography>
      )}

      <Link href={href}>
        <a>
          {location && (
            <Typography className={classes.typographyRoot}>
              <LocationIcon fontSize="small" className={classes.iconRoot} />
              {location}
            </Typography>
          )}
        </a>
      </Link>

      {Boolean(hosts.length) && (
        <Typography className={classes.typographyRoot}>
          <HostIcon fontSize="small" className={classes.iconRoot} />
          {`${Messages.events.form.host()}: `}
          <UserName userId={hosts[0]?.userId} withLink />
        </Typography>
      )}

      <Link href={href}>
        <a>
          {endsAt && displayEventDuration(startsAt, endsAt) && (
            <Typography className={classes.typographyRoot}>
              <ClockIcon fontSize="small" className={classes.iconRoot} />
              {displayEventDuration(startsAt, endsAt)}
            </Typography>
          )}

          {!inForm && (
            <Typography
              className={classes.typographyRoot}
              style={{ color: BLURPLE }}
            >
              <MotionIcon fontSize="small" className={classes.iconRoot} />
              {Messages.events.motion()}
            </Typography>
          )}
        </a>
      </Link>
    </div>
  );
};

export default EventMotionDetails;
