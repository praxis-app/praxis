import { useReactiveVar } from '@apollo/client';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useState } from 'react';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import Rule from '../../components/Rules/Rule';
import RuleForm from '../../components/Rules/RuleForm';
import Droppable from '../../components/Shared/Droppable';
import Flex from '../../components/Shared/Flex';
import GhostButton from '../../components/Shared/GhostButton';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import Modal from '../../components/Shared/Modal';
import ProgressBar from '../../components/Shared/ProgressBar';
import { isLoggedInVar } from '../../graphql/cache';
import { useUpdateRulesPriorityMutation } from '../../graphql/rules/mutations/gen/UpdateRulesPriority.gen';
import {
  ServerRulesDocument,
  useServerRulesQuery,
} from '../../graphql/rules/queries/gen/ServerRules.gen';

const ServerRules = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const [
    updateRules,
    { loading: updateRulesLoading, error: updateRulesError },
  ] = useUpdateRulesPriorityMutation();

  const {
    data,
    client,
    error: serverRulesError,
    loading: serverRulesLoading,
  } = useServerRulesQuery({
    variables: { isLoggedIn },
  });

  const { t } = useTranslation();

  const serverRules = data?.serverRules;
  const canManageRules = !!data?.me?.serverPermissions.manageRules;

  const handleDragEnd = async (dropResult: DropResult) => {
    if (!dropResult.destination || !serverRules) {
      return;
    }
    const newRules = [...serverRules];
    const { source, destination } = dropResult;

    const [removed] = newRules.splice(source.index, 1);
    newRules.splice(destination.index, 0, removed);

    const newRulesWithCorrectOrder = newRules.map((rule, index) => ({
      ...rule,
      priority: index,
    }));

    client.writeQuery({
      query: ServerRulesDocument,
      data: { serverRules: newRulesWithCorrectOrder, me: data?.me },
      variables: { isLoggedIn },
    });

    await updateRules({
      variables: {
        rulesData: {
          rules: newRulesWithCorrectOrder.map((rule) => ({
            id: rule.id,
            priority: rule.priority,
          })),
        },
      },
    });
  };

  if (serverRulesError || updateRulesError) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (serverRulesLoading) {
    return <ProgressBar />;
  }

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <LevelOneHeading header>
          {t('rules.headers.serverRules')}
        </LevelOneHeading>

        {canManageRules && (
          <GhostButton
            sx={{ marginBottom: 3.5 }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t('rules.labels.create')}
          </GhostButton>
        )}
      </Flex>

      <Card>
        <CardContent>
          {!serverRules?.length && (
            <Typography textAlign="center" paddingTop={2} paddingBottom={1}>
              {t('rules.prompts.noRules')}
            </Typography>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable
              droppableId="droppable"
              isDropDisabled={!canManageRules || updateRulesLoading}
            >
              {(droppableProvided, droppableSnapshot) => (
                <Box
                  {...droppableProvided.droppableProps}
                  ref={droppableProvided.innerRef}
                  sx={{
                    bgcolor: droppableSnapshot.isDraggingOver
                      ? 'rgba(255, 255, 255, 0.2)'
                      : undefined,
                  }}
                >
                  {serverRules?.map((rule, index) => (
                    <Draggable
                      key={rule.id}
                      draggableId={rule.id.toString()}
                      isDragDisabled={!canManageRules || updateRulesLoading}
                      index={index}
                    >
                      {(draggableProvided, draggableSnapshot) => (
                        <Box
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                        >
                          <Rule
                            rule={rule}
                            canManageRules={canManageRules}
                            isDragging={
                              draggableSnapshot.isDragging ||
                              droppableSnapshot.isDraggingOver
                            }
                            isLast={index + 1 !== serverRules.length}
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
        </CardContent>
      </Card>

      <Modal
        title={t('rules.headers.createRule')}
        contentStyles={{ minHeight: '30vh' }}
        onClose={() => setIsCreateModalOpen(false)}
        open={isCreateModalOpen}
        centeredTitle
      >
        <RuleForm onSubmit={() => setIsCreateModalOpen(false)} />
      </Modal>
    </>
  );
};

export default ServerRules;
