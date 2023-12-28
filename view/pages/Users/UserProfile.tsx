import { useReactiveVar } from '@apollo/client';
import { Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Feed from '../../components/Shared/Feed';
import Link from '../../components/Shared/Link';
import ProgressBar from '../../components/Shared/ProgressBar';
import ToggleForms from '../../components/Shared/ToggleForms';
import UserProfileCard from '../../components/Users/UserProfileCard';
import {
  DEFAULT_PAGE_SIZE,
  NavigationPaths,
} from '../../constants/shared.constants';
import { inviteTokenVar, isLoggedInVar } from '../../graphql/cache';
import { useUserProfileQuery } from '../../graphql/users/queries/gen/UserProfile.gen';
import { useUserProfileFeedLazyQuery } from '../../graphql/users/queries/gen/UserProfileFeed.gen';

const UserProfile = () => {
  const inviteToken = useReactiveVar(inviteTokenVar);
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [prevEndCursor, setPrevEndCursor] = useState<string>();

  const { name } = useParams();
  const { data, loading, error } = useUserProfileQuery({
    variables: { name },
    skip: !name || !isLoggedIn,
  });

  const [getFeed, { data: feedData, loading: feedLoading }] =
    useUserProfileFeedLazyQuery();

  const { t } = useTranslation();
  const theme = useTheme();

  useEffect(() => {
    if (!isLoggedIn || !name) {
      return;
    }
    getFeed({
      variables: {
        first: rowsPerPage,
        isLoggedIn,
        name,
      },
    });
  }, [name, isLoggedIn, getFeed, rowsPerPage]);

  const handleNextPage = async () => {
    if (!feedData?.user.profileFeed.pageInfo.hasNextPage || !name) {
      return;
    }
    const { pageInfo } = feedData.user.profileFeed;
    const { endCursor, hasPreviousPage } = pageInfo;
    if (hasPreviousPage) {
      setPrevEndCursor(endCursor);
    }
    await getFeed({
      variables: {
        first: rowsPerPage,
        after: endCursor,
        isLoggedIn,
        name,
      },
    });
  };

  const handlePrevPage = async () => {
    if (!name) {
      return;
    }
    await getFeed({
      variables: {
        first: rowsPerPage,
        after: prevEndCursor,
        isLoggedIn,
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

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    return null;
  }

  const { me, user } = data;
  const isMe = me?.id === user.id;

  return (
    <>
      <UserProfileCard user={user} />
      {isMe && <ToggleForms me={me} />}

      <Feed
        feedItems={feedData?.user.profileFeed}
        isLoading={feedLoading}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
      />
    </>
  );
};

export default UserProfile;
