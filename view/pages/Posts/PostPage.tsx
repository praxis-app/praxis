import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import PostCard from '../../components/Posts/PostCard';
import ProgressBar from '../../components/Shared/ProgressBar';
import { isVerifiedVar } from '../../graphql/cache';
import { usePostLazyQuery } from '../../graphql/posts/queries/gen/Post.gen';
import { isDeniedAccess } from '../../utils/error.utils';

const PostPage = () => {
  const isVerified = useReactiveVar(isVerifiedVar);
  const [getPost, { data, loading, error }] = usePostLazyQuery({});

  const { id } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      getPost({
        variables: {
          id: parseInt(id),
          isVerified,
        },
      });
    }
  }, [id, getPost, isVerified]);

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
