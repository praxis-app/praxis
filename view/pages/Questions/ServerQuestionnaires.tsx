import { Card, CardContent, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QuestionnaireTicketCard from '../../components/Questions/QuestionnaireTicketCard';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import Pagination from '../../components/Shared/Pagination';
import { QuestionnaireTicketStatus } from '../../constants/question.constants';
import {
  DEFAULT_PAGE_SIZE,
  NavigationPaths,
  TAB_QUERY_PARAM,
} from '../../constants/shared.constants';
import { useServerQuestionnairesLazyQuery } from '../../graphql/questions/queries/gen/ServerQuestionnaires.gen';

const ServerQuestionnaires = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState(0);

  const [getQuestionnaires, { data, loading, error }] =
    useServerQuestionnairesLazyQuery();

  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tabParam = searchParams.get('tab');

  useEffect(() => {
    let status = QuestionnaireTicketStatus.Submitted;

    if (!tabParam) {
      setTab(0);
    }
    if (tabParam === QuestionnaireTicketStatus.InProgress) {
      status = QuestionnaireTicketStatus.InProgress;
      setTab(1);
    }
    if (tabParam === QuestionnaireTicketStatus.Approved) {
      status = QuestionnaireTicketStatus.Approved;
      setTab(2);
    }
    if (tabParam === QuestionnaireTicketStatus.Denied) {
      status = QuestionnaireTicketStatus.Denied;
      setTab(3);
    }
    getQuestionnaires({
      variables: {
        limit: DEFAULT_PAGE_SIZE,
        offset: 0,
        status,
      },
    });
  }, [tabParam, setTab, getQuestionnaires]);

  const pathPrefix = `${NavigationPaths.ServerQuestionnaires}${TAB_QUERY_PARAM}`;
  const inProgressTab = `${pathPrefix}${QuestionnaireTicketStatus.InProgress}`;
  const approvedTab = `${pathPrefix}${QuestionnaireTicketStatus.Approved}`;
  const deniedTab = `${pathPrefix}${QuestionnaireTicketStatus.Denied}`;

  const onChangePage = async (newPage: number) => {
    if (!tabParam) {
      return;
    }
    await getQuestionnaires({
      variables: {
        status: tabParam,
        limit: rowsPerPage,
        offset: newPage * rowsPerPage,
      },
    });
  };

  const getNoQuestionnairesMessage = () => {
    switch (tabParam) {
      case QuestionnaireTicketStatus.InProgress:
        return t('questions.prompts.noInProgressQuestionnaires');
      case QuestionnaireTicketStatus.Approved:
        return t('questions.prompts.noApprovedQuestionnaires');
      case QuestionnaireTicketStatus.Denied:
        return t('questions.prompts.noDeniedQuestionnaires');
      default:
        return t('questions.prompts.noSubmittedQuestionnaires');
    }
  };

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  return (
    <>
      <LevelOneHeading header>
        {t('questions.labels.questionnaires')}
      </LevelOneHeading>

      <Card>
        <Tabs textColor="inherit" value={tab}>
          <Tab
            label={t('questions.labels.submitted')}
            onClick={() => navigate(NavigationPaths.ServerQuestionnaires)}
          />
          <Tab
            label={t('questions.labels.inProgress')}
            onClick={() => navigate(inProgressTab)}
          />
          <Tab
            label={t('questions.labels.approved')}
            onClick={() => navigate(approvedTab)}
          />
          <Tab
            label={t('questions.labels.denied')}
            onClick={() => navigate(deniedTab)}
          />
        </Tabs>
      </Card>

      <Pagination
        count={data?.questionnaireTicketCount}
        isLoading={loading}
        onChangePage={onChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        showTopPagination={false}
      >
        {data?.questionnaireTickets.map((questionnaire) => (
          <QuestionnaireTicketCard
            key={questionnaire.id}
            questionnaireTicket={questionnaire}
          />
        ))}

        {data?.questionnaireTickets.length === 0 && (
          <Card>
            <CardContent
              sx={{
                '&:last-child': { paddingBottom: 2.2 },
                textAlign: 'center',
              }}
            >
              <Typography marginY={1.5}>
                {getNoQuestionnairesMessage()}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Pagination>
    </>
  );
};

export default ServerQuestionnaires;
