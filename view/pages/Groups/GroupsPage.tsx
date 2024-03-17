import { useReactiveVar } from '@apollo/client';
import DiscoverGroups from '../../components/Groups/DiscoverGroups';
import PublicGroupsList from '../../components/Groups/PublicGroupsList';
import { isVerifiedVar } from '../../graphql/cache';

const GroupsPage = () => {
  const isVerified = useReactiveVar(isVerifiedVar);

  if (!isVerified) {
    return <PublicGroupsList />;
  }
  return <DiscoverGroups />;
};

export default GroupsPage;
