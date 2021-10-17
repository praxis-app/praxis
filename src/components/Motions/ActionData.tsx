import Link from "next/link";
import { Typography } from "@material-ui/core";
import {
  displaySettingValue,
  permissionDisplayName,
  settingDisplayName,
} from "../../utils/clientIndex";
import { ResourcePaths } from "../../constants/common";
import { GroupAspects } from "../../constants/group";
import { ActionTypes } from "../../constants/motion";
import muiTheme from "../../styles/Shared/theme";
import { baseUrl } from "../../utils/clientIndex";
import Messages from "../../utils/messages";
import UserName from "../Users/Name";
import RoleName from "../Roles/Name";

interface TextProps {
  aspect?: string;
  text?: string;
  data?: string;
}

const ActionLabel = ({ aspect, text, data }: TextProps) => {
  return (
    <Typography style={{ marginTop: 6 }}>
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
  id?: string;
  action: string;
  actionData: ActionData;
}

const ActionData = ({ id, action, actionData }: ActionDataProps) => {
  const inForm = !id;

  if (
    (action === ActionTypes.CreateRole || action === ActionTypes.ChangeRole) &&
    actionData.groupRole &&
    actionData.groupRolePermissions
  )
    return (
      <div style={{ marginBottom: inForm ? 12 : 0 }}>
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
      <div style={{ marginBottom: inForm ? 12 : 0 }}>
        <ActionLabel text={Messages.motions.groups.proposedRoleAssignment()} />

        <Typography>
          • Role: <RoleName roleId={actionData.groupRoleId} />
        </Typography>
        <Typography>
          • Member: <UserName userId={actionData.userId} />
        </Typography>
      </div>
    );

  if (action === ActionTypes.ChangeSettings && actionData.groupSettings)
    return (
      <div style={{ marginBottom: inForm ? 12 : 0 }}>
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
        <div
          style={{
            color: muiTheme.palette.primary.main,
            fontFamily: "Inter Bold",
            marginBottom: 2,
          }}
        >
          {Messages.motions.groups.proposedAspect(GroupAspects.Image)}
        </div>
        <Link href={`${ResourcePaths.Motion}${id}`}>
          <a>
            <img
              src={baseUrl + actionData.groupImagePath}
              alt={Messages.images.couldNotRender()}
              style={{
                width: "60%",
                display: "block",
                marginTop: 6,
              }}
            />
          </a>
        </Link>
      </>
    );

  return null;
};

export default ActionData;
