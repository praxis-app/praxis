import { InputBaseProps, InputBase as MuiInputBase } from '@mui/material';
import { SxProps, styled } from '@mui/material/styles';
import UserAvatar from '../Users/UserAvatar';
import Flex from './Flex';

const InputBase = styled(MuiInputBase)<InputBaseProps>(({ theme }) => ({
  width: '100%',
  marginLeft: 12,
  padding: 0,
  '& .MuiInputBase-input': {
    fontSize: 21,
    '&::placeholder': {
      color: theme.palette.primary.light,
    },
  },
}));

const TextFieldWithAvatar = (props: InputBaseProps) => {
  const isLargeText =
    typeof props.value === 'string' && props.value.length > 85;

  const inputStyles: SxProps = {
    '& .MuiInputBase-input': {
      fontSize: isLargeText ? '16px' : '21px',
      transition: 'font-size 0.3s ease-in-out',
    },
  };

  return (
    <Flex sx={{ marginBottom: 1 }}>
      <UserAvatar withLink />
      <InputBase {...props} type="text" sx={inputStyles} />
    </Flex>
  );
};

export default TextFieldWithAvatar;
