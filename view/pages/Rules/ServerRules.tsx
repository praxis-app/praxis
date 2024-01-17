import { useReactiveVar } from '@apollo/client';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useState } from 'react';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
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
import { useServerRulesQuery } from '../../graphql/rules/queries/gen/ServerRules.gen';

const ServerRules = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const { data, loading, error } = useServerRulesQuery({
    variables: { isLoggedIn },
  });

  const { t } = useTranslation();

  const serverRules = data?.serverRules;
  const canManageRules = !!data?.me?.serverPermissions.manageRules;

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
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

          <DragDropContext
            onDragEnd={(dropResult) => {
              console.log('drag end', dropResult);
            }}
          >
            {serverRules?.map((rule, index) => (
              <Droppable droppableId={`droppable-${index + 1}`} key={rule.id}>
                {(droppableProvided, droppableSnapshot) => (
                  <Box
                    ref={droppableProvided.innerRef}
                    style={{
                      backgroundColor: droppableSnapshot.isDraggingOver
                        ? 'rgba(255, 255, 255, 0.2)'
                        : undefined,
                    }}
                    {...droppableProvided.droppableProps}
                  >
                    {droppableProvided.placeholder}
                    <Draggable draggableId={index.toString()} index={index}>
                      {(draggableProvided, draggableSnapshot) => (
                        <Box
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                        >
                          <Rule
                            rule={rule}
                            isLast={index + 1 !== serverRules.length}
                            canManageRules={canManageRules}
                            isDragging={draggableSnapshot.isDragging}
                          />
                        </Box>
                      )}
                    </Draggable>
                  </Box>
                )}
              </Droppable>
            ))}
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
