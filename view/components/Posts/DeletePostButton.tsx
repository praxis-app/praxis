import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NavigationPaths } from '../../constants/shared.constants';
import { toastVar } from '../../graphql/cache';
import { useDeletePostMutation } from '../../graphql/posts/mutations/gen/DeletePost.gen';
import { removePost } from '../../utils/post.utils';
import DeleteButton from '../Shared/DeleteButton';

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
