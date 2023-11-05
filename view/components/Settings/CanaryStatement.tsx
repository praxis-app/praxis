import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/time.utils';
import { CanaryStatementFragment } from '../../graphql/settings/fragments/gen/CanaryStatement.gen';

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

interface Props {
  canary?: CanaryStatementFragment | null;
}

const CanaryStatement = ({ canary }: Props) => {
  const { t } = useTranslation();

  const urlifyText = (text: string) =>
    text.replace(URL_REGEX, (url) => {
      return (
        '<a href="' +
        url +
        '" rel="noopener noreferrer" target="_blank" style="color:#e4e6ea;">' +
        url +
        '</a>'
      );
    });

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
