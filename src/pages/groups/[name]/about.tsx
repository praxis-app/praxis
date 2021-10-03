import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { truncate } from "lodash";

import { breadcrumbsVar } from "../../../apollo/client/localState";
import Messages from "../../../utils/messages";
import {
  ResourcePaths,
  TruncationSizes,
  TypeNames,
} from "../../../constants/common";
import CompactText from "../../../components/Shared/CompactText";
import {
  useGroupByName,
  useRolesByGroupId,
  useSettingsByGroupId,
} from "../../../hooks";
import {
  canShowSetting,
  displaySettingValue,
  settingDisplayName,
  settingValue,
} from "../../../utils/clientIndex";
import { GroupSettings } from "../../../constants/setting";
import RoleCompact from "../../../components/Roles/RoleCompact";

const GroupsAbout = () => {
  const { query } = useRouter();
  const [group, _setGroup, groupLoading] = useGroupByName(query.name);
  const [groupSettings, _setSettings, groupSettingsLoading] =
    useSettingsByGroupId(group?.id);
  const [roles, _setRoles, rolesLoading] = useRolesByGroupId(group?.id);
  const votingType = settingValue(GroupSettings.VotingType, groupSettings);
  const [roleExpanded, setRoleExpanded] = useState<string | false>(false);

  useEffect(() => {
    if (group)
      breadcrumbsVar([
        {
          label: truncate(group.name, {
            length: TruncationSizes.ExtraSmall,
          }),
          href: `${ResourcePaths.Group}${group.name}`,
        },
        {
          label: Messages.groups.breadcrumbs.about(),
        },
      ]);
    else breadcrumbsVar([]);

    return () => {
      breadcrumbsVar([]);
    };
  }, [group]);

  const handleRoleClick =
    (roleId: string) => (_event: ChangeEvent<any>, expanded: boolean) => {
      setRoleExpanded(expanded ? roleId : false);
    };

  if (groupLoading || rolesLoading || groupSettingsLoading)
    return <CircularProgress />;
  if (!group)
    return <Typography>{Messages.items.notFound(TypeNames.Group)}</Typography>;

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
