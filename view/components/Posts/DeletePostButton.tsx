import { ApolloCache, FetchResult } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toastVar } from '../../apollo/cache';
import {
  DeletePostMutation,
  useDeletePostMutation,
} from '../../apollo/posts/generated/DeletePost.mutation';
import { NavigationPaths, TypeNames } from '../../constants/shared.constants';
import DeleteButton from '../Shared/DeleteButton';

export const removePost =
  (postId: number) =>
  (cache: ApolloCache<any>, { errors }: FetchResult<DeletePostMutation>) => {
    if (errors) {
      toastVar({ status: 'error', title: errors[0].message });
      return;
    }
    const postCacheId = cache.identify({
      __typename: TypeNames.Post,
      id: postId,
    });
    cache.evict({ id: postCacheId });
    cache.gc();
  };

interface Props {
  postId: number;
}

const DeletePostButton = ({ postId }: Props) => {
  const [deletePost] = useDeletePostMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = async () => {
    navigate(NavigationPaths.Home);
    await deletePost({
      variables: { id: postId },
      update: removePost(postId),
      onError() {
        toastVar({
          status: 'error',
          title: t('errors.somethingWentWrong'),
        });
      },
    });
  };

  const handleClickWithConfirm = () =>
    window.confirm(t('prompts.deleteItem', { itemType: 'post' })) &&
    handleClick();

  return (
    <DeleteButton onClick={handleClickWithConfirm}>
      {t('posts.actions.deletePost')}
    </DeleteButton>
  );
};

export default DeletePostButton;
