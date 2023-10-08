import {
  Card,
  CardContent as MuiCardContent,
  styled,
  Typography,
} from '@mui/material';
import { truncate } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { useMemberRequestsLazyQuery } from '../../apollo/groups/generated/MemberRequests.query';
import { isDeniedAccess } from '../../utils/error.utils';
import ProgressBar from '../../components/Shared/ProgressBar';
import { getGroupPath } from '../../utils/group.utils';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import MemberRequest from '../../components/Groups/MemberRequest';
import { TruncationSizes } from '../../constants/shared.constants';
import { useEffect } from 'react';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 15,
  },
}));

const GroupMemberRequests = () => {
  const [getGroupMembersRequests, { data, loading, error }] =
    useMemberRequestsLazyQuery();

  const { name } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const memberRequests = data?.group.memberRequests;

  useEffect(() => {
    if (name) {
      getGroupMembersRequests({
        variables: { groupName: name },
      });
    }
  }, [name, getGroupMembersRequests]);

  if (isDeniedAccess(error)) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!memberRequests) {
    return null;
  }

  const breadcrumbs = [
    {
      label: truncate(name, {
        length: isDesktop ? TruncationSizes.Small : TruncationSizes.ExtraSmall,
      }),
      href: getGroupPath(name || ''),
    },
    {
      label: t('groups.labels.memberRequests', {
        count: memberRequests.length || 0,
      }),
    },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      {!!memberRequests.length && name && (
        <Card>
          <CardContent>
            {memberRequests.map((memberRequest) => (
              <MemberRequest
                key={memberRequest.id}
                groupName={name}
                memberRequest={memberRequest}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default GroupMemberRequests;
