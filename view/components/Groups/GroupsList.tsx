import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GroupCard from '../../components/Groups/GroupCard';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { useGroupsLazyQuery } from '../../graphql/groups/queries/gen/Groups.gen';
import { isDeniedAccess } from '../../utils/error.utils';
import LevelOneHeading from '../Shared/LevelOneHeading';
import Pagination from '../Shared/Pagination';
import GroupForm from './GroupForm';

const GroupsList = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const [getGroups, { data, loading, error }] = useGroupsLazyQuery({
    errorPolicy: 'all',
  });

  const { t } = useTranslation();

  useEffect(() => {
    getGroups({
      variables: {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      },
    });
  }, [rowsPerPage, page, getGroups]);

  const onChangePage = async (newPage: number) => {
    await getGroups({
      variables: {
        limit: rowsPerPage,
        offset: newPage * rowsPerPage,
      },
    });
  };

  if (!data && error) {
    if (isDeniedAccess(error)) {
      return <Typography>{t('prompts.permissionDenied')}</Typography>;
    }
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  return (
    <>
      <LevelOneHeading header>
        {t('groups.headers.discoverGroups')}
      </LevelOneHeading>

      <GroupForm />

      <Pagination
        count={data?.groupsCount}
        isLoading={loading}
        onChangePage={onChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
      >
        {data?.groups.map((group) => (
          <GroupCard
            key={group.id}
            canRemoveGroups={data.me.serverPermissions.removeGroups}
            currentUserId={data.me.id}
            group={group}
          />
        ))}
      </Pagination>
    </>
  );
};

export default GroupsList;
