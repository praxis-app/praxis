import { InputBase as MuiInputBase, InputBaseProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import UserAvatar from '../Users/UserAvatar';
import Flex from './Flex';

const InputBase = styled(MuiInputBase)<InputBaseProps>(({ theme }) => ({
  width: '100%',
  marginLeft: 12,
  '& .MuiInputBase-input': {
    fontSize: 21,
    '&::placeholder': {
      color: theme.palette.primary.light,
    },
  },
}));

const TextFieldWithAvatar = (props: InputBaseProps) => (
  <Flex sx={{ marginBottom: 1 }}>
    <UserAvatar withLink />
    <InputBase {...props} type="text" />
  </Flex>
);

export default TextFieldWithAvatar;
