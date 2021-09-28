import { useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CircularProgress,
  Divider,
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
import { useGroupByName, useSettingsByGroupId } from "../../../hooks";
import {
  canShowSetting,
  displayName,
  displaySettingValue,
  settingValue,
} from "../../../utils/clientIndex";
import { GroupSettings } from "../../../constants/setting";

const GroupsAbout = () => {
  const { query } = useRouter();
  const [group, _, groupLoading] = useGroupByName(query.name);
  const [groupSettings] = useSettingsByGroupId(group?.id);
  const votingType = settingValue(GroupSettings.VotingType, groupSettings);

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

  if (groupLoading) return <CircularProgress />;
  if (!group)
    return <Typography>{Messages.items.notFound(TypeNames.Group)}</Typography>;

  return (
    <Card>
      <CardContent>
        {group.description && (
          <>
            <Typography variant="h6">
              {Messages.about.labels.about()}
            </Typography>

            <Typography>
              <CompactText text={group.description} />
            </Typography>

            <Divider style={{ marginTop: 18, marginBottom: 12 }} />
          </>
        )}

        <Typography variant="h6">{Messages.groups.settings.name()}</Typography>

        {groupSettings.map((setting) => {
          if (canShowSetting(setting.name, votingType))
            return (
              <Typography key={setting.id}>
                {displayName(setting.name)}: {displaySettingValue(setting)}
              </Typography>
            );
        })}
      </CardContent>
    </Card>
  );
};

export default GroupsAbout;
