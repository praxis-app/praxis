import { LabelDisplayedRowsArgs, TablePagination } from '@mui/material';
import { ChangeEvent, MouseEvent, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsDesktop } from '../../hooks/shared.hooks';

interface Props {
  children: ReactNode;
  count: number;
  isLoading: boolean;
  onNextPage(): void;
  onPrevPage(): void;
  rowsPerPage: number;
  setRowsPerPage(rowsPerPage: number): void;
}

const Pagination = ({
  children,
  count,
  isLoading,
  onNextPage,
  onPrevPage,
  rowsPerPage,
  setRowsPerPage,
}: Props) => {
  const [page, setPage] = useState(0);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const selectProps = {
    sx: {
      display: isDesktop ? undefined : 'none',
    },
  };

  const getDisplayedRowsLabel = ({
    count,
    from,
    to,
  }: LabelDisplayedRowsArgs) => {
    if (isLoading) {
      return t('pagination.loading');
    }
    return `${from}-${to} ${t('pagination.of')} ${count}`;
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

  const renderPagination = (bottom = false) => {
    if (bottom && isLoading) {
      return null;
    }
    return (
      <TablePagination
        component="div"
        count={count}
        labelDisplayedRows={getDisplayedRowsLabel}
        labelRowsPerPage={isDesktop ? undefined : <></>}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        page={isLoading ? 0 : page}
        rowsPerPage={rowsPerPage}
        SelectProps={selectProps}
        sx={{ marginBottom: bottom ? 0 : 1.5 }}
      />
    );
  };

  return (
    <>
      {renderPagination()}
      {children}
      {renderPagination(true)}
    </>
  );
};

export default Pagination;
