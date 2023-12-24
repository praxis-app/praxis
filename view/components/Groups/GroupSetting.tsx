import { Box, Divider, Typography } from '@mui/material';
import Flex from '../Shared/Flex';

const SETTING_DESCRIPTION_WIDTH = '70%';

interface Props {
  name: string;
  description: string;
  value: string | number;
  divider?: boolean;
}

const GroupSetting = ({ name, description, value, divider = true }: Props) => (
  <>
    <Flex gap="40px">
      <Box width={SETTING_DESCRIPTION_WIDTH}>
        <Typography paddingBottom={0.25}>{name}</Typography>

        <Typography fontSize={12} color="text.secondary">
          {description}
        </Typography>
      </Box>

      <Flex
        alignSelf="center"
        bgcolor="rgb(0, 0, 0, 0.1)"
        borderRadius="8px"
        flexDirection="column"
        height="60px"
        justifyContent="center"
        width="120px"
      >
        <Typography textAlign="center">{value}</Typography>
      </Flex>
    </Flex>

    {divider && <Divider sx={{ paddingX: 3 }} />}
  </>
);

export default GroupSetting;
