import { RouteObject } from 'react-router-dom';
import EditGroup from '../pages/Groups/EditGroup';
import EditGroupRole from '../pages/Groups/EditGroupRole';
import GroupMemberRequests from '../pages/Groups/GroupMemberRequests';
import GroupMembers from '../pages/Groups/GroupMembers';
import GroupPage from '../pages/Groups/GroupPage';
import GroupRoles from '../pages/Groups/GroupRoles';
import GroupSettings from '../pages/Groups/GroupSettings';
import GroupsIndex from '../pages/Groups/GroupsIndex';

const groupsRouter: RouteObject = {
  path: '/groups',
  children: [
    {
      path: '',
      element: <GroupsIndex />,
    },
    {
      path: ':name',
      element: <GroupPage />,
    },
    {
      path: ':name/edit',
      element: <EditGroup />,
    },
    {
      path: ':name/settings',
      element: <GroupSettings />,
    },
    {
      path: ':name/members',
      element: <GroupMembers />,
    },
    {
      path: ':name/requests',
      element: <GroupMemberRequests />,
    },
    {
      path: ':name/roles',
      element: <GroupRoles />,
    },
    {
      path: ':name/roles/:id/edit',
      element: <EditGroupRole />,
    },
  ],
};

export default groupsRouter;
