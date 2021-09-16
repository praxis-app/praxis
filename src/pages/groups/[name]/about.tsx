import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
} from "@material-ui/core";
import { truncate } from "lodash";

import { GROUP_BY_NAME } from "../../../apollo/client/queries";
import { breadcrumbsVar } from "../../../apollo/client/localState";
import Messages from "../../../utils/messages";
import {
  ResourcePaths,
  TruncationSizes,
  TypeNames,
} from "../../../constants/common";
import CompactText from "../../../components/Shared/CompactText";
import { useSettingsByGroupId } from "../../../hooks";
import {
  canShowSetting,
  displayName,
  displaySettingValue,
  settingValueByName,
} from "../../../utils/clientIndex";
import { GroupSettings } from "../../../constants/setting";

const GroupsAbout = () => {
  const { query } = useRouter();
  const [group, setGroup] = useState<ClientGroup>();
  const [groupSettings] = useSettingsByGroupId(group?.id);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);
  const votingType = settingValueByName(
    GroupSettings.VotingType,
    groupSettings
  );

  useEffect(() => {
    if (query.name) {
      getGroupRes({
        variables: { name: query.name },
      });
    }
  }, [query.name]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

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

  if (groupRes.loading) return <CircularProgress />;
  if (!group) return <>{Messages.items.notFound(TypeNames.Group)}</>;

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
