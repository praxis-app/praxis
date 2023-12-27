import { TablePagination } from '@mui/material';
import { ChangeEvent, MouseEvent, ReactNode, useState } from 'react';
import { useIsDesktop } from '../../hooks/shared.hooks';

interface Props {
  children: ReactNode;
  count: number;
  onNextPage(): void;
  onPrevPage(): void;
  rowsPerPage: number;
  setRowsPerPage(rowsPerPage: number): void;
}

const Pagination = ({
  children,
  count,
  onNextPage,
  onPrevPage,
  rowsPerPage,
  setRowsPerPage,
}: Props) => {
  const [page, setPage] = useState(0);
  const isDesktop = useIsDesktop();

  const selectProps = {
    sx: { display: isDesktop ? undefined : 'none' },
  };

  const handleChangePage = (
    _: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    if (newPage > page) {
      onNextPage();
    } else {
      onPrevPage();
    }
    setPage(newPage);
  };

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
