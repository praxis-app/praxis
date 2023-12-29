import {
  LabelDisplayedRowsArgs,
  SxProps,
  TablePagination,
} from '@mui/material';
import { ChangeEvent, MouseEvent, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalStorageKey } from '../../constants/shared.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';

interface Props {
  children: ReactNode;
  count?: number;
  isLoading: boolean;
  onChangePage(page: number): void;
  rowsPerPage: number;
  setRowsPerPage(rowsPerPage: number): void;
  page: number;
  setPage(page: number): void;
  sx?: SxProps;
}

const Pagination = ({
  children,
  count = 0,
  isLoading,
  onChangePage,
  rowsPerPage,
  setRowsPerPage,
  page,
  setPage,
  sx,
}: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const rowsPerPageSelection = localStorage.getItem(
      LocalStorageKey.RowsPerPage,
    );
    if (rowsPerPageSelection) {
      setRowsPerPage(parseInt(rowsPerPageSelection));
    }
  }, [setRowsPerPage]);

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
    onChangePage(newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    localStorage.setItem(LocalStorageKey.RowsPerPage, event.target.value);
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
        rowsPerPageOptions={[10, 25, 50]}
        SelectProps={selectProps}
        sx={{ marginBottom: bottom ? 0 : 1.5, ...sx }}
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
