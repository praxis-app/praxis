import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GroupCard from '../../components/Groups/GroupCard';
import GroupTipsCard from '../../components/Groups/GroupTipsCard';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { authFailedVar } from '../../graphql/cache';
import { usePublicGroupsLazyQuery } from '../../graphql/groups/queries/gen/PublicGroups.gen';
import { isDeniedAccess } from '../../utils/error.utils';
import Pagination from '../Shared/Pagination';

const PublicGroupsList = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const authFailed = useReactiveVar(authFailedVar);
  const [getGroups, { data, loading, error }] = usePublicGroupsLazyQuery({
    errorPolicy: 'all',
  });

  const { t } = useTranslation();

  useEffect(() => {
    if (!authFailed) {
      return;
    }
    getGroups({
      variables: {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      },
    });
  }, [rowsPerPage, page, getGroups, authFailed]);

  const onChangePage = async (newPage: number) => {
    await getGroups({
      variables: {
        limit: rowsPerPage,
        offset: newPage * rowsPerPage,
      },
    });
  };

  if (!data) {
    if (isDeniedAccess(error)) {
      return <Typography>{t('prompts.permissionDenied')}</Typography>;
    }
    if (error) {
      return <Typography>{t('errors.somethingWentWrong')}</Typography>;
    }
    return null;
  }

  return (
    <>
      <GroupTipsCard />

      <Pagination
        count={data?.publicGroupsCount}
        isLoading={loading}
        onChangePage={onChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
      >
        {data?.publicGroups.map((group) => (
          <GroupCard group={group} key={group.id} />
        ))}
      </Pagination>
    </>
  );
};

export default PublicGroupsList;
