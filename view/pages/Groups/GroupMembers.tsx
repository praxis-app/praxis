import {
  Card,
  CardContent as MuiCardContent,
  styled,
  Typography,
} from '@mui/material';
import { truncate } from 'lodash';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGroupMembersLazyQuery } from '../../apollo/groups/generated/GroupMembers.query';
import GroupMember from '../../components/Groups/GroupMember';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import ProgressBar from '../../components/Shared/ProgressBar';
import { TruncationSizes } from '../../constants/shared.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getGroupPath } from '../../utils/group.utils';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 15,
  },
}));

const GroupMembers = () => {
  const [getGroupMembers, { data, loading, error }] =
    useGroupMembersLazyQuery();

  const { name } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const group = data?.group;
  const me = data?.me;

  useEffect(() => {
    if (name) {
      getGroupMembers({
        variables: { name },
      });
    }
  }, [name, getGroupMembers]);

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!group || !me) {
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
      label: t('groups.labels.groupMembers', {
        count: group.members.length || 0,
      }),
    },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      {!!group.members.length && (
        <Card>
          <CardContent>
            {group.members.map((member) => (
              <GroupMember
                key={member.id}
                member={member}
                currentUserId={me.id}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default GroupMembers;
