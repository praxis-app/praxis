import { useReactiveVar } from '@apollo/client';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  PaperProps,
  Popover,
  Typography,
} from '@mui/material';
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
import { useIsDesktop } from '../../hooks/shared.hooks';

const ServerRules = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const {
    client,
    data: serverRulesData,
    error: serverRulesError,
    loading: serverRulesLoading,
  } = useServerRulesQuery({
    variables: { isLoggedIn },
  });

  const [
    updateRules,
    { loading: updateRulesLoading, error: updateRulesError },
  ] = useUpdateRulesPriorityMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const me = serverRulesData?.me;
  const serverRules = serverRulesData?.serverRules;
  const canManageRules = !!me?.serverPermissions.manageRules;

  const paperProps: PaperProps = {
    sx: {
      paddingX: 1.75,
      paddingY: 1.25,
    },
  };

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
      data: { serverRules: newRulesWithCorrectOrder, me },
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

  const handleCloseModal = () => setIsCreateModalOpen(false);

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => {
    if (updateRulesLoading && isDesktop) {
      setAnchorEl(event.currentTarget);
    }
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
              {(droppableProvided) => (
                <Box
                  {...droppableProvided.droppableProps}
                  ref={droppableProvided.innerRef}
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
                          onMouseEnter={handlePopoverOpen}
                          onMouseLeave={() => setAnchorEl(null)}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                        >
                          <Rule
                            rule={rule}
                            canManageRules={canManageRules}
                            isDragging={draggableSnapshot.isDragging}
                            isLast={index + 1 !== serverRules.length}
                            isLoading={updateRulesLoading}
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

        <Popover
          anchorEl={anchorEl}
          open={!!anchorEl && updateRulesLoading}
          slotProps={{ paper: paperProps }}
          sx={{ pointerEvents: 'none' }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Flex alignItems="center" gap="8px" paddingTop="5px">
            <CircularProgress size={14} />
            <Typography>{t('states.loading')}</Typography>
          </Flex>
        </Popover>
      </Card>

      <Modal
        title={t('rules.headers.createRule')}
        topGap={isDesktop ? undefined : '150px'}
        contentStyles={{ minHeight: '30vh' }}
        onClose={handleCloseModal}
        open={isCreateModalOpen}
        centeredTitle
      >
        <RuleForm onSubmit={handleCloseModal} onCancel={handleCloseModal} />
      </Modal>
    </>
  );
};

export default ServerRules;
