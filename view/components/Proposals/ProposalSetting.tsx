import { Box, Divider, Typography } from '@mui/material';
import Flex from '../Shared/Flex';

const SETTING_DESCRIPTION_WIDTH = '60%';

interface Props {
  name: string;
  description: string;
  value: string | number;
  divider?: boolean;
}

const ProposalSetting = ({
  name,
  description,
  value,
  divider = true,
}: Props) => (
  <>
    <Flex justifyContent="space-between">
      <Box>
        <Typography>{name}</Typography>

        <Typography
          fontSize={12}
          color="text.secondary"
          width={SETTING_DESCRIPTION_WIDTH}
        >
          {description}
        </Typography>
      </Box>

      <Typography>{value}</Typography>
    </Flex>

    {divider && <Divider sx={{ paddingX: 3 }} />}
  </>
);

export default ProposalSetting;
