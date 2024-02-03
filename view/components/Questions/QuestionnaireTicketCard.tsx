import {
  Box,
  Card,
  CardContent,
  CardHeader as MuiCardHeader,
  styled,
} from '@mui/material';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MIDDOT_WITH_SPACES } from '../../constants/shared.constants';
import { toastVar } from '../../graphql/cache';
import { QuestionnaireTicketCardFragment } from '../../graphql/questions/fragments/gen/QuestionnaireTicketCard.gen';
import { useDeleteQuestionnaireTicketMutation } from '../../graphql/questions/mutations/gen/DeleteQuestionnaireTicket.gen';
import {
  ServerQuestionnairesDocument,
  ServerQuestionnairesQuery,
} from '../../graphql/questions/queries/gen/ServerQuestionnaires.gen';
import { timeAgo } from '../../utils/time.utils';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';
import QuestionnaireTicketCardFooter from './QuestionnaireTicketCardFooter';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingBottom: 0,
  '& .MuiCardHeader-avatar': {
    marginRight: 11,
  },
  '& .MuiCardHeader-title': {
    fontSize: 15,
  },
}));

interface Props {
  questionnaireTicket: QuestionnaireTicketCardFragment;
}

const QuestionnaireTicketCard = ({ questionnaireTicket }: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteQuestionnaireTicket] = useDeleteQuestionnaireTicketMutation();
  const { t } = useTranslation();

  const { id, createdAt, user } = questionnaireTicket;
  const questionnaireTicketPath = `/questionnaires/${id}`;
  const formattedDate = timeAgo(createdAt);

  const deleteInvitePrompt = t('prompts.deleteItem', {
    itemType: 'questionnaire ticket',
  });

  const handleDelete = async () =>
    await deleteQuestionnaireTicket({
      variables: { id },
      update(cache) {
        cache.updateQuery<ServerQuestionnairesQuery>(
          { query: ServerQuestionnairesDocument },
          (serverQuestionnairesData) =>
            produce(serverQuestionnairesData, (draft) => {
              if (!draft) {
                return;
              }
              const index = draft.serverQuestionnaireTickets.findIndex(
                (p) => p.id === id,
              );
              draft.serverQuestionnaireTickets.splice(index, 1);
            }),
        );
        const cacheId = cache.identify(questionnaireTicket);
        cache.evict({ id: cacheId });
        cache.gc();
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });

  const renderTitle = () => (
    <Link
      href={questionnaireTicketPath}
      sx={{ fontSize: 14, color: 'text.secondary' }}
    >
      <Box component="span">{user.name}</Box>
      {MIDDOT_WITH_SPACES}
      <Box color="inherit" component="span" fontSize={13}>
        {formattedDate}
      </Box>
    </Link>
  );

  return (
    <Card>
      <CardHeader
        avatar={
          <UserAvatar user={user} href={questionnaireTicketPath} withLink />
        }
        title={renderTitle()}
        action={
          <ItemMenu
            anchorEl={menuAnchorEl}
            deleteItem={handleDelete}
            deletePrompt={deleteInvitePrompt}
            setAnchorEl={setMenuAnchorEl}
            canDelete
          />
        }
      />
      <CardContent sx={{ '&:last-child': { paddingBottom: 1.5 } }}>
        TODO: Add remaining layout
      </CardContent>

      <QuestionnaireTicketCardFooter
        questionnaireTicket={questionnaireTicket}
      />
    </Card>
  );
};

export default QuestionnaireTicketCard;
