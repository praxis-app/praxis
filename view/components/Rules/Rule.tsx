import { useReactiveVar } from '@apollo/client';
import { DragIndicator } from '@mui/icons-material';
import { Box, Divider, Typography } from '@mui/material';
import { produce } from 'immer';
import { CSSProperties, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserEvents } from '../../constants/shared.constants';
import { isLoggedInVar, toastVar } from '../../graphql/cache';
import { RuleFragment } from '../../graphql/rules/fragments/gen/Rule.gen';
import { useDeleteRuleMutation } from '../../graphql/rules/mutations/gen/DeleteRule.gen';
import {
  ServerRulesDocument,
  ServerRulesQuery,
} from '../../graphql/rules/queries/gen/ServerRules.gen';
import { urlifyText } from '../../utils/shared.utils';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import Modal from '../Shared/Modal';
import RuleForm from './RuleForm';

interface Props {
  canManageRules: boolean;
  isDragging: boolean;
  isLast: boolean;
  isLoading: boolean;
  rule: RuleFragment;
}

const Rule = ({
  canManageRules,
  isDragging,
  isLast,
  isLoading,
  rule,
}: Props) => {
  const [isClicking, setIsClicking] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [deleteRule, { loading: deleteLoading }] = useDeleteRuleMutation();

  const { t } = useTranslation();

  const { id, title, description, priority, __typename } = rule;
  const urlifiedDescription = urlifyText(description);

  const backgroundColor =
    isClicking && isDragging ? 'rgba(255,255,255,0.025)' : 'transparent';

  useEffect(() => {
    const handleMouseUp = () => setIsClicking(false);
    window.addEventListener(BrowserEvents.MouseUp, handleMouseUp, {
      passive: true,
    });
    return () => {
      window.removeEventListener(BrowserEvents.MouseUp, handleMouseUp);
    };
  }, []);

  const getCursor = (): CSSProperties['cursor'] => {
    if (isLoading || deleteLoading || !canManageRules) {
      return 'initial';
    }
    if (isClicking || isDragging) {
      return 'grabbing';
    }
    return 'grab';
  };

  const handleDelete = async () => {
    await deleteRule({
      variables: { id },
      update(cache) {
        cache.updateQuery<ServerRulesQuery>(
          {
            query: ServerRulesDocument,
            variables: { isLoggedIn },
          },
          (rulesData) => {
            if (!rulesData) {
              return;
            }
            const newRules = rulesData.serverRules.map((rule) => {
              if (priority > rule.priority) {
                return rule;
              }
              return { ...rule, priority: rule.priority - 1 };
            });
            return produce(rulesData, (draft) => {
              draft.serverRules = newRules;
            });
          },
        );
        const cacheId = cache.identify({ id, __typename });
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

  const handleMouseDown = () => {
    if (!canManageRules || isLoading) {
      return;
    }
    setIsClicking(true);
  };

  const handleEditBtnClick = () => {
    setIsUpdateModalOpen(true);
    setMenuAnchorEl(null);
  };

  const handleCloseModal = () => {
    setIsUpdateModalOpen(false);
  };

  return (
    <>
      <Flex
        justifyContent="space-between"
        padding={isDragging ? '6px' : undefined}
        bgcolor={backgroundColor}
        borderRadius="8px"
        gap="6px"
      >
        <Flex
          flex={1}
          gap="14px"
          onMouseDown={handleMouseDown}
          sx={{ userSelect: 'none', cursor: getCursor() }}
        >
          {canManageRules && <DragIndicator sx={{ color: 'text.secondary' }} />}

          <Typography>{priority + 1}</Typography>

          <Box>
            <Typography>{title}</Typography>

            <Typography
              fontSize="12px"
              color="text.secondary"
              dangerouslySetInnerHTML={{ __html: urlifiedDescription }}
              whiteSpace="pre-wrap"
            />
          </Box>
        </Flex>

        <ItemMenu
          canDelete={canManageRules}
          canUpdate={canManageRules}
          deleteItem={handleDelete}
          deleteBtnLabel={t('rules.labels.delete')}
          deletePrompt={t('rules.prompts.confirmDelete')}
          buttonStyles={{ height: 40, transform: 'translateY(-8px)' }}
          updateBtnLabel={t('rules.labels.edit')}
          onEditButtonClick={handleEditBtnClick}
          setAnchorEl={setMenuAnchorEl}
          anchorEl={menuAnchorEl}
          loading={deleteLoading}
          prependChildren
        />
      </Flex>

      <Modal
        title={t('rules.headers.updateRule')}
        contentStyles={{ minHeight: '30vh' }}
        onClose={() => setIsUpdateModalOpen(false)}
        open={isUpdateModalOpen}
        centeredTitle
      >
        <RuleForm
          editRule={rule}
          onSubmit={handleCloseModal}
          onCancel={handleCloseModal}
        />
      </Modal>

      {isLast && <Box marginY={2}>{!isDragging && <Divider />}</Box>}
    </>
  );
};

export default Rule;
