import { useReactiveVar } from '@apollo/client';
import GroupsList from '../../components/Groups/GroupsList';
import PublicGroupsList from '../../components/Groups/PublicGroupsList';
import { isVerifiedVar } from '../../graphql/cache';

const GroupsPage = () => {
  const isVerified = useReactiveVar(isVerifiedVar);

  if (!isVerified) {
    return <PublicGroupsList />;
  }
  return <GroupsList />;
};

export default GroupsPage;
