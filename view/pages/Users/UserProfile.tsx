import { useReactiveVar } from '@apollo/client';
import { TaskAlt } from '@mui/icons-material';
import { Button, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Feed from '../../components/Shared/Feed';
import Flex from '../../components/Shared/Flex';
import Link from '../../components/Shared/Link';
import ProgressBar from '../../components/Shared/ProgressBar';
import ToggleForms from '../../components/Shared/ToggleForms';
import UserProfileCard from '../../components/Users/UserProfileCard';
import {
  DEFAULT_PAGE_SIZE,
  NavigationPaths,
} from '../../constants/shared.constants';
import {
  inviteTokenVar,
  isLoggedInVar,
  isVerifiedVar,
} from '../../graphql/cache';
import { useMeQuery } from '../../graphql/users/queries/gen/Me.gen';
import { useUserProfileQuery } from '../../graphql/users/queries/gen/UserProfile.gen';
import { useUserProfileFeedLazyQuery } from '../../graphql/users/queries/gen/UserProfileFeed.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';

const UserProfile = () => {
  const inviteToken = useReactiveVar(inviteTokenVar);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const isVerified = useReactiveVar(isVerifiedVar);

  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useMeQuery({ skip: !isLoggedIn });

  const { name } = useParams();

  const isSkipping = () => {
    if (!meData?.me.name || !name || !isLoggedIn) {
      return true;
    }
    if (!isVerified && meData.me.name !== name) {
      return true;
    }
    return false;
  };

  const {
    data: userProfileData,
    loading: userProfileLoading,
    error: userProfileError,
  } = useUserProfileQuery({
    variables: { name, isVerified },
    skip: isSkipping(),
  });

  const [getFeed, { data: feedData, loading: feedLoading }] =
    useUserProfileFeedLazyQuery();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (!isVerified || !name) {
      return;
    }
    getFeed({
      variables: {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        name,
      },
    });
  }, [name, isVerified, getFeed, rowsPerPage, page]);

  const handleChangePage = async (newPage: number) => {
    await getFeed({
      variables: {
        limit: rowsPerPage,
        offset: newPage * rowsPerPage,
        name,
      },
    });
  };

  if (!isLoggedIn) {
    return (
      <>
        <Typography sx={{ color: theme.palette.text.secondary }} gutterBottom>
          {t('prompts.permissionDenied')}
        </Typography>
        <Typography sx={{ color: theme.palette.text.secondary }}>
          Please{' '}
          {inviteToken && (
            <>
              <Link
                href={`${NavigationPaths.SignUp}/${inviteToken}`}
                sx={{ marginRight: '0.5ch' }}
              >
                {t('users.actions.signUp')}
              </Link>
              or
            </>
          )}
          <Link
            href={NavigationPaths.LogIn}
            sx={{ marginLeft: inviteToken ? '0.5ch' : 0 }}
          >
            {t('users.actions.logIn')}
          </Link>{' '}
          to view user profiles.
        </Typography>
      </>
    );
  }

  if (userProfileLoading || meLoading) {
    return <ProgressBar />;
  }

  if (!isVerified && meData && meData.me.name !== name) {
    return (
      <Flex flexDirection="column">
        <Typography paddingBottom={2.5}>
          {t('users.prompts.verifyToSeeOtherProfiles')}
        </Typography>

        <Button
          startIcon={<TaskAlt sx={{ marginRight: 0.25 }} />}
          onClick={() => navigate(NavigationPaths.MyVibeCheck)}
          sx={{
            textTransform: 'none',
            alignSelf: isDesktop ? 'flex-start' : 'center',
          }}
          variant="outlined"
        >
          {t('users.actions.getVerified')}
        </Button>
      </Flex>
    );
  }

  if (userProfileError || meError) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (!userProfileData) {
    return null;
  }

  const { me, user } = userProfileData;
  const isMe = me?.id === user.id;

  return (
    <>
      <UserProfileCard
        canRemoveMembers={me?.serverPermissions?.removeMembers}
        user={user}
      />

      {isVerified && (
        <>
          {isMe && <ToggleForms me={me} />}

          <Feed
            feedItems={feedData?.user.profileFeed}
            totalCount={feedData?.user.profileFeedCount}
            isLoading={feedLoading}
            onChangePage={handleChangePage}
            page={page}
            rowsPerPage={rowsPerPage}
            setPage={setPage}
            setRowsPerPage={setRowsPerPage}
          />
        </>
      )}
    </>
  );
};

export default UserProfile;
