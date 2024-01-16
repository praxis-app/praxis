import { Box, Divider, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RuleFragment } from '../../graphql/rules/fragments/gen/Rule.gen';
import { useDeleteRuleMutation } from '../../graphql/rules/mutations/gen/DeleteRule.gen';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';

interface Props {
  rule: RuleFragment;
  isLast: boolean;
}

const Rule = ({
  rule: { id, priority, title, description, __typename },
  isLast,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteRule, { loading }] = useDeleteRuleMutation();

  const { t } = useTranslation();

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
          deleteBtnLabel={t('rules.labels.delete')}
          deletePrompt={t('rules.prompts.confirmDelete')}
          setAnchorEl={setMenuAnchorEl}
          loading={loading}
          prependChildren
          // TODO: Account for permissions
          canDelete
        />
      </Flex>

      {isLast && <Divider sx={{ marginY: 2 }} />}
    </>
  );
};

export default Rule;
