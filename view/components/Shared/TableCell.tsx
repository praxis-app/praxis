import { TableCell as MuiTableCell, styled } from '@mui/material';

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  color: theme.palette.text.primary,
  borderColor: theme.palette.divider,
}));

export default TableCell;
