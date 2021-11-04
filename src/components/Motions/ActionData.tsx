import Link from "next/link";
import { createStyles, makeStyles, Theme, Typography } from "@material-ui/core";
import clsx from "clsx";

import {
  displaySettingValue,
  permissionDisplayName,
  settingDisplayName,
} from "../../utils/clientIndex";
import { ResourcePaths } from "../../constants/common";
import { GroupAspects } from "../../constants/group";
import { ActionTypes } from "../../constants/motion";
import { baseUrl } from "../../utils/clientIndex";
import Messages from "../../utils/messages";
import UserName from "../Users/Name";
import RoleName from "../Roles/Name";
import EventMotionDetails from "../Events/MotionDetails";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rootInForm: {
      marginBottom: 12,
    },
    groupImage: {
      width: "60%",
      display: "block",
      marginTop: 6,
    },
    groupImageLabel: {
      color: theme.palette.primary.main,
      fontFamily: "Inter Bold",
      marginBottom: 2,
    },
    actionLabelText: {
      marginTop: 6,
    },
  })
);

interface TextProps {
  aspect?: string;
  text?: string;
  data?: string;
}

const ActionLabel = ({ aspect, text, data }: TextProps) => {
  const classes = useStyles();
  return (
    <Typography className={classes.actionLabelText}>
      <span
        style={{
          fontFamily: "Inter Bold",
        }}
      >
        {aspect
          ? Messages.motions.groups.proposedAspect(aspect) + (data ? ":" : "")
          : text}
      </span>
      {data && " " + data}
    </Typography>
  );
};

interface ActionDataProps {
  action: string;
  actionData: ActionData;
  motionId?: string;
  inForm?: boolean;
}

const ActionData = ({
  action,
  actionData,
  motionId,
  inForm,
}: ActionDataProps) => {
  const classes = useStyles();

  if (
    (action === ActionTypes.CreateRole || action === ActionTypes.ChangeRole) &&
    actionData.groupRole &&
    actionData.groupRolePermissions
  )
    return (
      <div className={clsx({ [classes.rootInForm]: inForm })}>
        {action === ActionTypes.CreateRole ? (
          <ActionLabel aspect={GroupAspects.Role} />
        ) : (
          <ActionLabel text={Messages.motions.groups.proposedRoleChange()} />
        )}
        <Typography>
          {"• "}
          <span style={{ color: actionData.groupRole.color }}>
            {actionData.groupRole.name}
          </span>
        </Typography>

        {actionData.groupRolePermissions.map((permission) => (
          <Typography key={permission.name}>
            {`• ${permissionDisplayName(permission.name)}: `}
            {permission.enabled
              ? Messages.roles.permissions.states.enabled()
              : Messages.roles.permissions.states.disabled()}
          </Typography>
        ))}
      </div>
    );

  if (
    action === ActionTypes.AssignRole &&
    actionData.groupRoleId &&
    actionData.userId
  )
    return (
      <div className={clsx({ [classes.rootInForm]: inForm })}>
        <ActionLabel text={Messages.motions.groups.proposedRoleAssignment()} />
        <Typography>
          {Messages.roles.labels.role()}
          <RoleName roleId={actionData.groupRoleId} />
        </Typography>
        <Typography>
          {Messages.roles.labels.member()}
          <UserName userId={actionData.userId} />
        </Typography>
      </div>
    );

  if (action === ActionTypes.ChangeSettings && actionData.groupSettings)
    return (
      <div className={clsx({ [classes.rootInForm]: inForm })}>
        <ActionLabel aspect={GroupAspects.Settings} />
        {actionData.groupSettings.map((setting) => (
          <Typography key={setting.id}>
            • {settingDisplayName(setting.name)}: {displaySettingValue(setting)}
          </Typography>
        ))}
      </div>
    );

  if (action === ActionTypes.ChangeName && actionData.groupName && !inForm)
    return (
      <ActionLabel aspect={GroupAspects.Name} data={actionData.groupName} />
    );

  if (
    action === ActionTypes.ChangeDescription &&
    actionData.groupDescription &&
    !inForm
  )
    return (
      <ActionLabel
        aspect={GroupAspects.Description}
        data={actionData.groupDescription}
      />
    );

  if (
    action === ActionTypes.ChangeImage &&
    actionData.groupImagePath &&
    !inForm
  )
    return (
      <>
        <div className={classes.groupImageLabel}>
          {Messages.motions.groups.proposedAspect(GroupAspects.Image)}
        </div>
        <Link href={`${ResourcePaths.Motion}${motionId}`}>
          <a>
            <img
              src={baseUrl + actionData.groupImagePath}
              alt={Messages.images.couldNotRender()}
              className={classes.groupImage}
            />
          </a>
        </Link>
      </>
    );

  if (action === ActionTypes.PlanEvent && actionData.groupEvent)
    return (
      <EventMotionDetails
        event={actionData.groupEvent}
        motionId={motionId}
        inForm={inForm}
      />
    );

  return null;
};

export default ActionData;
