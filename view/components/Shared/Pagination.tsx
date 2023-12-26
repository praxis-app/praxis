import { TablePagination } from '@mui/material';
import { ChangeEvent, MouseEvent } from 'react';
import { useIsDesktop } from '../../hooks/shared.hooks';

interface Props {
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
}

const Pagination = ({ page, rowsPerPage, setPage, setRowsPerPage }: Props) => {
  const isDesktop = useIsDesktop();

  const selectProps = {
    sx: { display: isDesktop ? undefined : 'none' },
  };

  const handleChangePage = (
    _: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => setPage(newPage);

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TablePagination
      component="div"
      page={page}
      count={100}
      labelRowsPerPage={isDesktop ? undefined : <></>}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPage={rowsPerPage}
      SelectProps={selectProps}
      sx={{ marginBottom: 1.5 }}
    />
  );
};

export default Pagination;
