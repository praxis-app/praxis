import { useReactiveVar } from '@apollo/client';
import { isLoggedInVar } from '../../apollo/cache';
import GroupsList from '../../components/Groups/GroupsList/GroupsList';
import PublicGroupsList from '../../components/Groups/PublicGroupsList/PublicGroupsList';

const GroupsIndex = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  if (!isLoggedIn) {
    return <PublicGroupsList />;
  }
  return <GroupsList />;
};

export default GroupsIndex;
