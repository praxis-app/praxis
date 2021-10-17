import { ChangeEvent, useState } from "react";
import {
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@material-ui/core";

import Messages from "../../utils/messages";
import CompactText from "../Shared/CompactText";
import { useRolesByGroupId, useSettingsByGroupId } from "../../hooks";
import {
  canShowSetting,
  displaySettingValue,
  settingDisplayName,
  settingValue,
} from "../../utils/clientIndex";
import { GroupSettings } from "../../constants/setting";
import RoleCompact from "../Roles/RoleCompact";

interface Props {
  group: ClientGroup;
}

const GroupsAbout = ({ group }: Props) => {
  const [groupSettings, _setSettings, groupSettingsLoading] =
    useSettingsByGroupId(group?.id);
  const [roles, _setRoles, rolesLoading] = useRolesByGroupId(group?.id);
  const votingType = settingValue(GroupSettings.VotingType, groupSettings);
  const [roleExpanded, setRoleExpanded] = useState<string | false>(false);

  const handleRoleClick =
    (roleId: string) => (_event: ChangeEvent<any>, expanded: boolean) => {
      setRoleExpanded(expanded ? roleId : false);
    };

  if (rolesLoading || groupSettingsLoading) return <CircularProgress />;

  return (
    <>
      {group.description && (
        <Card>
          <CardContent>
            <Typography variant="h6">
              {Messages.about.labels.about()}
            </Typography>

            <Typography>
              <CompactText text={group.description} />
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6">
            {Messages.groups.settings.name()}
          </Typography>

          {groupSettings.map((setting) => {
            if (canShowSetting(setting.name, votingType))
              return (
                <Typography key={setting.id}>
                  {settingDisplayName(setting.name) + ": "}
                  {displaySettingValue(setting)}
                </Typography>
              );
          })}
        </CardContent>
      </Card>

      <div>
        {roles.map((role) => {
          return (
            <RoleCompact
              role={role}
              expanded={roleExpanded}
              handleClick={handleRoleClick}
              key={role.id}
            />
          );
        })}
      </div>
    </>
  );
};

export default GroupsAbout;
