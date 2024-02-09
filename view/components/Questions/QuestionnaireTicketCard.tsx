import {
  Box,
  Card,
  CardContent,
  CardHeader as MuiCardHeader,
  SxProps,
  Typography,
  styled,
} from '@mui/material';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuestionnaireTicketStatus } from '../../constants/question.constants';
import {
  MIDDOT_WITH_SPACES,
  NavigationPaths,
} from '../../constants/shared.constants';
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
  inModal?: boolean;
}

const QuestionnaireTicketCard = ({ questionnaireTicket, inModal }: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteQuestionnaireTicket] = useDeleteQuestionnaireTicketMutation();

  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id, status, user, createdAt } = questionnaireTicket;
  const questionnaireTicketPath = `/questionnaires/${id}`;
  const isQuestionnaireTicketPage = pathname.includes(questionnaireTicketPath);
  const formattedDate = timeAgo(createdAt);

  const deleteInvitePrompt = t('prompts.deleteItem', {
    itemType: 'questionnaire ticket',
  });

  const cardContentStyles: SxProps = {
    paddingTop: 2.25,
    paddingBottom: 2.5,
    paddingX: inModal ? 0 : undefined,
  };

  const getStatus = () => {
    if (status === QuestionnaireTicketStatus.Submitted) {
      return t('questions.labels.submitted');
    }
    if (status === QuestionnaireTicketStatus.Approved) {
      return t('questions.labels.approved');
    }
    if (status === QuestionnaireTicketStatus.Denied) {
      return t('questions.labels.denied');
    }
    return t('questions.labels.inProgress');
  };

  const handleDelete = async () => {
    if (isQuestionnaireTicketPage) {
      navigate(NavigationPaths.ServerQuestionnaires);
    }
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
  };

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

  const renderQuestionnaireTicket = () => (
    <>
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
        sx={{
          paddingX: inModal ? 0 : undefined,
          paddingTop: inModal ? 0 : undefined,
        }}
      />
      <CardContent sx={cardContentStyles}>
        <Typography>
          {`${t('questions.labels.status')}: ${getStatus()}`}
        </Typography>
      </CardContent>

      <QuestionnaireTicketCardFooter
        questionnaireTicket={questionnaireTicket}
        inModal={inModal}
      />
    </>
  );

  if (inModal) {
    return renderQuestionnaireTicket();
  }

  return <Card>{renderQuestionnaireTicket()}</Card>;
};

export default QuestionnaireTicketCard;
