import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { isLoggedInVar } from '../../apollo/cache';
import { usePostLazyQuery } from '../../apollo/posts/generated/Post.query';
import PostCard from '../../components/Posts/PostCard';
import ProgressBar from '../../components/Shared/ProgressBar';
import { isDeniedAccess } from '../../utils/error.utils';

const PostPage = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [getPost, { data, loading, error }] = usePostLazyQuery({});

  const { id } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      getPost({
        variables: {
          id: parseInt(id),
          isLoggedIn,
        },
      });
    }
  }, [id, getPost, isLoggedIn]);

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    if (isDeniedAccess(error)) {
      return <Typography>{t('prompts.permissionDenied')}</Typography>;
    }

    if (error) {
      return <Typography>{t('errors.somethingWentWrong')}</Typography>;
    }
    return null;
  }

  return <PostCard post={data.post} />;
};

export default PostPage;
