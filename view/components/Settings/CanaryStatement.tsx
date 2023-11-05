import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CanaryStatementFragment } from '../../graphql/settings/fragments/gen/CanaryStatement.gen';
import { urlifyText } from '../../utils/shared.utils';
import { formatDate } from '../../utils/time.utils';

interface Props {
  canary?: CanaryStatementFragment | null;
}

const CanaryStatement = ({ canary }: Props) => {
  const { t } = useTranslation();

  if (!canary) {
    return (
      <Typography>{t('canary.prompts.canaryStatementMissing')}</Typography>
    );
  }

  const body = urlifyText(canary.statement);
  const formattedUpdatedAt = formatDate(canary.updatedAt);
  const updatedAtMessage = t('canary.labels.updatedAt', {
    updatedAt: formattedUpdatedAt,
  });

  return (
    <Box paddingTop={1}>
      <Typography whiteSpace="pre-wrap" paddingBottom={3} lineHeight={1}>
        <Box component="span" dangerouslySetInnerHTML={{ __html: body }} />
      </Typography>

      <Typography color="text.secondary">{updatedAtMessage}</Typography>
    </Box>
  );
};

export default CanaryStatement;
