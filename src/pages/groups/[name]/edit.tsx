import { useEffect } from "react";
import { useRouter } from "next/router";
import { CircularProgress, Typography } from "@material-ui/core";

import GroupForm from "../../../components/Groups/Form";
import Messages from "../../../utils/messages";
import {
  useCurrentUser,
  useGroupByName,
  useHasPermissionByGroupId,
  useSettingsByGroupId,
} from "../../../hooks";
import { GroupSettings, SettingStates } from "../../../constants/setting";
import { settingValue } from "../../../utils/clientIndex";
import { GroupPermissions } from "../../../constants/role";
import { breadcrumbsVar } from "../../../apollo/client/localState";
import { ResourcePaths, TypeNames } from "../../../constants/common";

const Edit = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [group, _setGroup, groupLoading] = useGroupByName(query.name);
  const [groupSettings, _setGroupSettings, groupSettingsLoading] =
    useSettingsByGroupId(group?.id);
  const [canEditGroup, canEditGroupLoading] = useHasPermissionByGroupId(
    GroupPermissions.EditGroup,
    group?.id
  );

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
      settingValue(GroupSettings.NoAdmin, groupSettings) === SettingStates.On
    );
  };

  if (groupLoading || groupSettingsLoading || canEditGroupLoading)
    return <CircularProgress />;
  if (!group)
    return <Typography>{Messages.items.notFound(TypeNames.Group)}</Typography>;
  if (currentUser && isNoAdmin()) return <>{Messages.groups.setToNoAdmin()}</>;
  if (!canEditGroup) return <>{Messages.users.permissionDenied()}</>;

  return <GroupForm group={group} isEditing />;
};

export default Edit;
