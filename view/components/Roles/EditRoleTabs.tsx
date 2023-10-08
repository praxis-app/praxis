import { Card, Tab, Tabs } from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { EditGroupRoleTabsFragment } from '../../apollo/groups/generated/EditGroupRoleTabs.fragment';
import { EditServerRoleTabsFragment } from '../../apollo/roles/generated/EditServerRoleTabs.fragment';
import { EditRoleTabNames } from '../../constants/role.constants';
import { useAboveBreakpoint } from '../../hooks/shared.hooks';
import DeleteGroupRoleButton from '../Groups/GroupRoles/DeleteGroupRoleButton';
import GroupPermissionsForm from '../Groups/GroupRoles/GroupPermissionsForm';
import GroupRoleForm from '../Groups/GroupRoles/GroupRoleForm';
import AddRoleMemberTab from './AddRoleMemberTab';
import DeleteServerRoleButton from './ServerRoles/DeleteServerRoleButton';
import ServerPermissionsForm from './ServerRoles/ServerPermissionsForm';
import ServerRoleForm from './ServerRoles/ServerRoleForm';

interface Props {
  role: EditServerRoleTabsFragment | EditGroupRoleTabsFragment;
}

const EditRoleTabs = ({ role }: Props) => {
  const [tab, setTab] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const isAboveSmall = useAboveBreakpoint('sm');

  const isGroupRole = 'group' in role;
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === EditRoleTabNames.Permissions) {
      setTab(1);
      return;
    }
    if (tabParam === EditRoleTabNames.Members) {
      setTab(2);
      return;
    }
    setTab(0);
  }, [tabParam, setTab]);

  const handleTabChange = (
    _: SyntheticEvent<Element, Event>,
    value: number,
  ) => {
    if (value === 1) {
      setSearchParams({ tab: EditRoleTabNames.Permissions });
      return;
    }
    if (value === 2) {
      setSearchParams({ tab: EditRoleTabNames.Members });
      return;
    }
    setSearchParams({});
  };

  return (
    <>
      <Card sx={{ marginBottom: 6 }}>
        <Tabs
          onChange={handleTabChange}
          value={tab}
          variant={isAboveSmall ? 'standard' : 'fullWidth'}
          centered
        >
          <Tab label={t('roles.tabs.display')} />
          <Tab label={t('roles.tabs.permissions')} />
          <Tab label={t('roles.tabs.members')} />
        </Tabs>
      </Card>

      {tab === 0 && (
        <>
          {isGroupRole ? (
            <GroupRoleForm editRole={role} groupId={role.group.id} />
          ) : (
            <ServerRoleForm editRole={role} />
          )}
          {isGroupRole ? (
            <DeleteGroupRoleButton role={role} />
          ) : (
            <DeleteServerRoleButton roleId={role.id} />
          )}
        </>
      )}

      {tab === 1 &&
        (isGroupRole ? (
          <GroupPermissionsForm
            permissions={role.permissions}
            roleId={role.id}
          />
        ) : (
          <ServerPermissionsForm
            permissions={role.permissions}
            roleId={role.id}
          />
        ))}

      {tab === 2 && (
        <AddRoleMemberTab
          availableUsersToAdd={role.availableUsersToAdd}
          role={role}
        />
      )}
    </>
  );
};

export default EditRoleTabs;
