import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { CircularProgress } from "@material-ui/core";

import { GROUP_BY_NAME } from "../../../apollo/client/queries";
import GroupForm from "../../../components/Groups/Form";
import Messages from "../../../utils/messages";
import {
  useCurrentUser,
  useHasPermissionByGroupId,
  useSettingsByGroupId,
} from "../../../hooks";
import { GroupSettings, SettingStates } from "../../../constants/setting";
import { noCache, settingValueByName } from "../../../utils/clientIndex";
import { GroupPermissions } from "../../../constants/role";
import { breadcrumbsVar } from "../../../apollo/client/localState";
import { ResourcePaths } from "../../../constants/common";

const Edit = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [group, setGroup] = useState<ClientGroup>();
  const [groupSettings, _, groupSettingsLoading] = useSettingsByGroupId(
    group?.id
  );
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME, noCache);
  const [canEditGroup, canEditGroupLoading] = useHasPermissionByGroupId(
    GroupPermissions.EditGroup,
    group?.id
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
    if (group && canEditGroup)
      breadcrumbsVar([
        {
          label: group.name,
          href: `${ResourcePaths.Group}${group.name}`,
        },
        {
          label: Messages.groups.breadcrumbs.editGroup(),
        },
      ]);
    else breadcrumbsVar([]);

    return () => {
      breadcrumbsVar([]);
    };
  }, [group, canEditGroup]);

  const isNoAdmin = (): boolean => {
    return (
      settingValueByName(GroupSettings.NoAdmin, groupSettings) ===
      SettingStates.On
    );
  };

  if (groupRes.loading || groupSettingsLoading || canEditGroupLoading)
    return <CircularProgress />;
  if (currentUser && isNoAdmin()) return <>{Messages.groups.setToNoAdmin()}</>;
  if (!canEditGroup) return <>{Messages.users.permissionDenied()}</>;

  return <GroupForm group={group} isEditing={true} />;
};

export default Edit;
