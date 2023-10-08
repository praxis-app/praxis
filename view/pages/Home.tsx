import { useReactiveVar } from '@apollo/client';
import { isLoggedInVar } from '../apollo/cache';
import PublicGroupsFeed from '../components/Groups/PublicGroupsFeed';
import HomeFeed from '../components/Users/HomeFeed';

const Home = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  if (!isLoggedIn) {
    return <PublicGroupsFeed />;
  }
  return <HomeFeed />;
};

export default Home;
