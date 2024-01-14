import { LikeFragment } from '../../graphql/likes/fragments/gen/Like.gen';

interface Props {
  like: LikeFragment;
}

const Like = ({ like }: Props) => {
  return <>{JSON.stringify(like)}</>;
};

export default Like;
