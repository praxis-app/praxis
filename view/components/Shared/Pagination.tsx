import { TablePagination } from '@mui/material';
import { ChangeEvent, MouseEvent, ReactNode } from 'react';
import { useIsDesktop } from '../../hooks/shared.hooks';

interface Props {
  children: ReactNode;
  count: number;
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
}

const Pagination = ({
  children,
  count,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
}: Props) => {
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

  const renderPagination = (bottom = false) => (
    <TablePagination
      component="div"
      page={page}
      count={count}
      labelRowsPerPage={isDesktop ? undefined : <></>}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPage={rowsPerPage}
      SelectProps={selectProps}
      sx={{ marginBottom: bottom ? 0 : 1.5 }}
    />
  );

  return (
    <>
      {renderPagination()}
      {children}
      {renderPagination(true)}
    </>
  );
};

export default Pagination;
