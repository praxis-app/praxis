import { useReactiveVar } from '@apollo/client';
import { Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import ProgressBar from '../../components/Shared/ProgressBar';
import EditProfileForm from '../../components/Users/EditProfileForm';
import { isVerifiedVar } from '../../graphql/cache';
import { useEditUserQuery } from '../../graphql/users/queries/gen/EditUser.gen';

const EditUserProfile = () => {
  const { name } = useParams();
  const isVerified = useReactiveVar(isVerifiedVar);
  const { data, loading, error } = useEditUserQuery({
    variables: { name, isVerified },
    skip: !name,
  });

  const { t } = useTranslation();

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
    <Card>
      <CardContent>
        <EditProfileForm
          submitButtonText={t('actions.save')}
          user={data.user}
        />
      </CardContent>
    </Card>
  );
};

export default EditUserProfile;
