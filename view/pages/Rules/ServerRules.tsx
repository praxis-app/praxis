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
          {serverRules?.map((rule, index) => (
            <Rule
              key={rule.id}
              rule={rule}
              isLast={index + 1 !== serverRules.length}
              canManageRules={canManageRules}
            />
          ))}
        </CardContent>
      </Card>

      <DragDropContext
        onDragEnd={(dropResult) => {
          console.log('drag end', dropResult);
        }}
      >
        {serverRules?.map((item, index) => (
          <Droppable droppableId={`droppable-${index + 1}`} key={item.id}>
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                style={{
                  backgroundColor: snapshot.isDraggingOver
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                }}
                {...provided.droppableProps}
              >
                {provided.placeholder}
                <Draggable draggableId={index.toString()} index={index}>
                  {(provided) => (
                    <Box
                      marginBottom={2}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Typography
                        sx={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        {JSON.stringify(item.title)}
                      </Typography>
                    </Box>
                  )}
                </Draggable>
              </Box>
            )}
          </Droppable>
        ))}
      </DragDropContext>

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
