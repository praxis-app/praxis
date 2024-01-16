import { Box, Divider, Typography } from '@mui/material';
import { RuleFragment } from '../../graphql/rules/fragments/gen/Rule.gen';
import Flex from '../Shared/Flex';

interface Props {
  rule: RuleFragment;
  isLast: boolean;
}

const Rule = ({ rule: { priority, title, description }, isLast }: Props) => {
  return (
    <>
      <Flex gap="14px">
        <Typography>{priority + 1}</Typography>

        <Box>
          <Typography>{title}</Typography>

          <Typography color="text.secondary" fontSize="12px">
            {description}
          </Typography>
        </Box>
      </Flex>

      {isLast && <Divider sx={{ marginY: 2 }} />}
    </>
  );
};

export default Rule;
