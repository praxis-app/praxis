import { Box, Divider, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../graphql/cache';
import { RuleFragment } from '../../graphql/rules/fragments/gen/Rule.gen';
import { useDeleteRuleMutation } from '../../graphql/rules/mutations/gen/DeleteRule.gen';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import Modal from '../Shared/Modal';
import RuleForm from './RuleForm';

interface Props {
  canManageRules: boolean;
  isLast: boolean;
  rule: RuleFragment;
  isDragging: boolean;
}

const Rule = ({ rule, isLast, canManageRules, isDragging }: Props) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const [deleteRule, { loading }] = useDeleteRuleMutation();

  const { t } = useTranslation();

  const { id, title, description, priority, __typename } = rule;

  const handleDelete = async () => {
    await deleteRule({
      variables: { id },
      update(cache) {
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

  return (
    <>
      <Flex justifyContent="space-between" gap="6px">
        <Flex gap="14px" sx={{ userSelect: 'none', cursor: 'grab' }}>
          <Typography>{priority + 1}</Typography>

          <Box>
            <Typography>{title}</Typography>

            <Typography color="text.secondary" fontSize="12px">
              {description}
            </Typography>
          </Box>
        </Flex>

        <ItemMenu
          canDelete={canManageRules}
          canUpdate={canManageRules}
          deleteItem={handleDelete}
          deleteBtnLabel={t('rules.labels.delete')}
          deletePrompt={t('rules.prompts.confirmDelete')}
          buttonStyles={{ height: 40, alignSelf: 'center' }}
          updateBtnLabel={t('rules.labels.edit')}
          onEditButtonClick={() => setIsUpdateModalOpen(true)}
          setAnchorEl={setMenuAnchorEl}
          anchorEl={menuAnchorEl}
          loading={loading}
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
          onSubmit={() => {
            setIsUpdateModalOpen(false);
            setMenuAnchorEl(null);
          }}
        />
      </Modal>

      {isLast && !isDragging && <Divider sx={{ marginY: 2 }} />}
    </>
  );
};

export default Rule;
