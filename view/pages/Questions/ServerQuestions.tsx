import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import QuestionEditorEntry from '../../components/Questions/QuestionEditorEntry';
import QuestionFormModal from '../../components/Questions/QuestionFormModal';
import Droppable from '../../components/Shared/Droppable';
import Flex from '../../components/Shared/Flex';
import GhostButton from '../../components/Shared/GhostButton';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useUpdateQuestionsPriorityMutation } from '../../graphql/questions/mutations/gen/UpdateQuestionsPriority.gen';
import {
  ServerQuestionsDocument,
  ServerQuestionsQuery,
  useServerQuestionsQuery,
} from '../../graphql/questions/queries/gen/ServerQuestions.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';

const ServerQuestions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: serverQuestionsData,
    loading: serverQuestionsLoading,
    error: serverQuestionsError,
  } = useServerQuestionsQuery();

  const [updateQuestions, { client, loading: updateQuestionsLoading }] =
    useUpdateQuestionsPriorityMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const serverQuestions = serverQuestionsData?.serverQuestions;

  const handleDragEnd = async (dropResult: DropResult) => {
    if (!dropResult.destination || !serverQuestions) {
      return;
    }
    const newQuestions = [...serverQuestions];
    const { source, destination } = dropResult;

    const [removed] = newQuestions.splice(source.index, 1);
    newQuestions.splice(destination.index, 0, removed);

    const newQuestionsWithCorrectOrder = newQuestions.map(
      (question, index) => ({
        ...question,
        priority: index,
      }),
    );

    client.writeQuery<ServerQuestionsQuery>({
      query: ServerQuestionsDocument,
      data: { serverQuestions: newQuestionsWithCorrectOrder },
    });

    await updateQuestions({
      variables: {
        questionsData: {
          questions: newQuestionsWithCorrectOrder.map((question) => ({
            id: question.id,
            priority: question.priority,
          })),
        },
      },
    });
  };

  if (serverQuestionsError) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (serverQuestionsLoading) {
    return <ProgressBar />;
  }

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <LevelOneHeading header>
          {isDesktop
            ? t('questions.labels.serverQuestions')
            : t('questions.labels.questions')}
        </LevelOneHeading>

        <GhostButton
          sx={{ marginBottom: 3.5 }}
          onClick={() => setIsModalOpen(true)}
        >
          {isDesktop
            ? t('questions.headers.createQuestion')
            : t('actions.create')}
        </GhostButton>
      </Flex>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="droppable"
          isDropDisabled={updateQuestionsLoading}
        >
          {(droppableProvided) => (
            <Box
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
            >
              {serverQuestions?.map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id.toString()}
                  isDragDisabled={updateQuestionsLoading}
                  index={index}
                >
                  {(draggableProvided, draggableSnapshot) => (
                    <Box
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                    >
                      <QuestionEditorEntry
                        key={question.id}
                        question={question}
                        isDragging={draggableSnapshot.isDragging}
                      />
                    </Box>
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <QuestionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ServerQuestions;
