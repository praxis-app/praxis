import { Typography } from "@material-ui/core";
import Link from "next/link";

import { ResourcePaths } from "../../constants/common";
import { GroupAspects } from "../../constants/group";
import { ActionTypes } from "../../constants/motion";
import { GroupSettings, SettingStates } from "../../constants/setting";
import muiTheme from "../../styles/Shared/theme";
import baseUrl from "../../utils/baseUrl";
import { displayName } from "../../utils/items";
import Messages from "../../utils/messages";

interface TextProps {
  aspect: string;
  data?: string;
}

const Text = ({ aspect, data }: TextProps) => {
  return (
    <Typography style={{ marginTop: 6 }}>
      <span
        style={{
          fontFamily: "Inter Bold",
        }}
      >
        {Messages.motions.groups.proposedAspect(aspect)}
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

  const displaySettingValue = ({ name, value }: SettingInput): string => {
    if (name === GroupSettings.RatificationThreshold) return value + "%";
    if (value === SettingStates.On) return Messages.settings.states.on();
    if (value === SettingStates.Off) return Messages.settings.states.off();
    return displayName(value);
  };

  if (action === ActionTypes.ChangeSettings && actionData.groupSettings)
    return (
      <div style={{ marginBottom: inForm ? 12 : 0 }}>
        <Text aspect={GroupAspects.Settings} />

        {actionData.groupSettings.map((setting) => (
          <Typography key={setting.id}>
            {displayName(setting.name)}: {displaySettingValue(setting)}
          </Typography>
        ))}
      </div>
    );

  if (action === ActionTypes.ChangeName && actionData.groupName && !inForm)
    return <Text aspect={GroupAspects.Name} data={actionData.groupName} />;

  if (
    action === ActionTypes.ChangeDescription &&
    actionData.groupDescription &&
    !inForm
  )
    return (
      <Text
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
