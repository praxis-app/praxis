import { SettingsSuggest } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  MenuItem,
  CardHeader as MuiCardHeader,
  SxProps,
  Typography,
  linearProgressClasses,
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
import { useIsDesktop } from '../../hooks/shared.hooks';
import { timeAgo } from '../../utils/time.utils';
import Accordion, {
  AccordionDetails,
  AccordionSummary,
} from '../Shared/Accordion';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';
import QuestionnaireTicketCardFooter from './QuestionnaireTicketCardFooter';
import QuestionnaireTicketSettingsModal from './QuestionnaireTicketSettingsModal';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingBottom: 0,
  '& .MuiCardHeader-avatar': {
    marginRight: 11,
  },
  '& .MuiCardHeader-title': {
    fontSize: 15,
  },
}));

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
  },
}));

interface Props {
  inModal?: boolean;
  isTicketPage?: boolean;
  questionnaireTicket: QuestionnaireTicketCardFragment;
}

const QuestionnaireTicketCard = ({
  inModal,
  isTicketPage,
  questionnaireTicket,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDetails, setShowDetails] = useState(!!isTicketPage);

  const [deleteQuestionnaireTicket] = useDeleteQuestionnaireTicketMutation();

  const { pathname } = useLocation();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  const {
    id,
    status,
    answerCount,
    questionCount,
    settings,
    agreementVoteCount,
    votesNeededToVerify,
    user,
    createdAt,
  } = questionnaireTicket;

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
  const cardHeaderStyles: SxProps = {
    paddingX: inModal ? 0 : undefined,
    paddingTop: inModal ? 0 : undefined,
  };
  const accordionStyles: SxProps = {
    backgroundColor: 'rgb(0, 0, 0, 0.1)',
    borderRadius: 2,
    paddingX: 2,
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

  const handleViewSettingsBtnClick = () => {
    setShowSettingsModal(true);
    setMenuAnchorEl(null);
  };

  const renderSubheader = () => (
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

  const renderMenu = () => {
    return (
      <ItemMenu
        anchorEl={menuAnchorEl}
        deleteItem={handleDelete}
        deletePrompt={deleteInvitePrompt}
        setAnchorEl={setMenuAnchorEl}
        prependChildren
        canDelete
      >
        <MenuItem onClick={handleViewSettingsBtnClick}>
          <SettingsSuggest fontSize="small" sx={{ marginRight: 1 }} />
          {t('proposals.labels.viewSettings')}
        </MenuItem>
      </ItemMenu>
    );
  };

  const renderQuestionnaireTicket = () => (
    <>
      <CardHeader
        avatar={
          <UserAvatar user={user} href={questionnaireTicketPath} withLink />
        }
        title={
          !isTicketPage && (
            <Link href={questionnaireTicketPath}>
              {t('questions.labels.questionnaireTicketNumber', { number: id })}
            </Link>
          )
        }
        subheader={renderSubheader()}
        action={renderMenu()}
        sx={cardHeaderStyles}
      />
      <CardContent sx={cardContentStyles}>
        <Accordion
          expanded={showDetails}
          onChange={() => setShowDetails((prev) => !prev)}
          sx={accordionStyles}
        >
          <AccordionSummary>
            <Typography>
              {`${t('questions.labels.status')}: ${getStatus()}`}
            </Typography>
          </AccordionSummary>

          <AccordionDetails sx={{ marginBottom: isDesktop ? 2.5 : 3 }}>
            <Flex justifyContent="space-between">
              <Typography>{t('questions.labels.questionsAnswered')}</Typography>
              <Typography>
                {answerCount} / {questionCount}
              </Typography>
            </Flex>
            <BorderLinearProgress
              sx={{ marginBottom: 3 }}
              variant="determinate"
              value={(answerCount / questionCount) * 100}
            />

            <Flex justifyContent="space-between">
              <Typography>{t('questions.labels.votesNeeded')}</Typography>
              <Typography>
                {agreementVoteCount} / {votesNeededToVerify}
              </Typography>
            </Flex>
            <BorderLinearProgress
              sx={{ marginBottom: 3 }}
              variant="determinate"
              value={(agreementVoteCount / votesNeededToVerify) * 100}
            />
          </AccordionDetails>
        </Accordion>
      </CardContent>

      <QuestionnaireTicketCardFooter
        questionnaireTicket={questionnaireTicket}
        inModal={inModal}
      />

      <QuestionnaireTicketSettingsModal
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        settings={settings}
      />
    </>
  );

  if (inModal) {
    return renderQuestionnaireTicket();
  }

  return <Card>{renderQuestionnaireTicket()}</Card>;
};

export default QuestionnaireTicketCard;
