import { useReactiveVar } from '@apollo/client';
import PublicGroupsFeed from '../../components/Groups/PublicGroupsFeed';
import HomeFeed from '../../components/Users/HomeFeed';
import { isLoggedInVar } from '../../graphql/cache';

const Home = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  if (!isLoggedIn) {
    return <PublicGroupsFeed />;
  }
  return <HomeFeed />;
};

export default Home;
