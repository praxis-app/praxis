import { Box, Divider, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RuleFragment } from '../../graphql/rules/fragments/gen/Rule.gen';
import { useDeleteRuleMutation } from '../../graphql/rules/mutations/gen/DeleteRule.gen';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import Modal from '../Shared/Modal';
import RuleForm from './RuleForm';

interface Props {
  rule: RuleFragment;
  isLast: boolean;
}

const Rule = ({ rule, isLast }: Props) => {
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
    });
  };

  return (
    <>
      <Flex justifyContent="space-between">
        <Flex gap="14px">
          <Typography>{priority + 1}</Typography>

          <Box>
            <Typography>{title}</Typography>

            <Typography color="text.secondary" fontSize="12px">
              {description}
            </Typography>
          </Box>
        </Flex>

        <ItemMenu
          anchorEl={menuAnchorEl}
          deleteItem={handleDelete}
          updateBtnLabel={t('rules.labels.edit')}
          deleteBtnLabel={t('rules.labels.delete')}
          deletePrompt={t('rules.prompts.confirmDelete')}
          onEditButtonClick={() => setIsUpdateModalOpen(true)}
          setAnchorEl={setMenuAnchorEl}
          loading={loading}
          prependChildren
          // TODO: Account for permissions
          canDelete
          canUpdate
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

      {isLast && <Divider sx={{ marginY: 2 }} />}
    </>
  );
};

export default Rule;
