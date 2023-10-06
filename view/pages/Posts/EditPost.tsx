import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useEditPostLazyQuery } from '../../apollo/posts/generated/EditPost.query';
import DeletePostButton from '../../components/Posts/DeletePostButton';
import PostForm from '../../components/Posts/PostForm';
import Card from '../../components/Shared/Card';
import ProgressBar from '../../components/Shared/ProgressBar';

const EditPost = () => {
  const [getPost, { data, loading, error }] = useEditPostLazyQuery();

  const { id } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      getPost({
        variables: { id: parseInt(id) },
      });
    }
  }, [id, getPost]);

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <Card sx={{ marginBottom: 2.5 }}>
        <PostForm editPost={data.post} />
      </Card>

      <DeletePostButton postId={data.post.id} />
    </>
  );
};

export default EditPost;
