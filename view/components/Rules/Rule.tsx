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
import { useIsDesktop } from '../../hooks/shared.hooks';
import { formatDateTime } from '../../utils/time.utils';
import Flex from '../Shared/Flex';
import FormattedText from '../Shared/FormattedText';
import ItemMenu from '../Shared/ItemMenu';
import Modal from '../Shared/Modal';
import RuleForm from './RuleForm';

interface Props {
  canManageRules?: boolean;
  isDragging?: boolean;
  isLast: boolean;
  isLoading?: boolean;
  rule: RuleFragment;
}

const Rule = ({
  canManageRules,
  isDragging,
  isLast,
  isLoading,
  rule,
}: Props) => {
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [deleteRule, { loading: deleteLoading }] = useDeleteRuleMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const { id, title, description, priority, updatedAt, __typename } = rule;

  const backgroundColor = isDragging
    ? 'rgba(255,255,255,0.025)'
    : 'transparent';

  useEffect(() => {
    const handleMouseUp = () => setIsGrabbing(false);
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
    if (isGrabbing) {
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
    setIsGrabbing(true);
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

          <Box title={formatDateTime(updatedAt)}>
            <Typography>{title}</Typography>

            <FormattedText
              text={description}
              color="text.secondary"
              fontSize="12px"
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
        topGap={isDesktop ? undefined : '150px'}
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
