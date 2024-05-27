import {
  Card,
  CardContent as MuiCardContent,
  Typography,
  styled,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Chat from '../../components/Chat/Chat';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import Pagination from '../../components/Shared/Pagination';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { useChatsQuery } from '../../graphql/chat/queries/gen/Chats.gen';

const CardContent = styled(MuiCardContent)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,

  '&:last-child': {
    paddingBottom: 14,
  },
}));

const Chats = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const { data, loading, error, refetch } = useChatsQuery();

  const { t } = useTranslation();

  const onChangePage = async (newPage: number) => {
    await refetch({
      limit: rowsPerPage,
      offset: newPage * rowsPerPage,
    });
  };

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  return (
    <>
      <LevelOneHeading header>{t('chat.headers.chats')}</LevelOneHeading>

      <Pagination
        count={data?.me.chatCount}
        isLoading={loading}
        onChangePage={onChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        showTopPagination={false}
      >
        <Card>
          <CardContent>
            {!data?.me.chatCount ? (
              <Typography>{t('chat.prompts.noChatsYet')}</Typography>
            ) : (
              <>
                {data.me.chats.map((chat) => (
                  <Chat key={chat.id} chat={chat} />
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </Pagination>
    </>
  );
};

export default Chats;
