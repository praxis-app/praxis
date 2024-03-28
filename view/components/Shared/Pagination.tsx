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
  isLoading?: boolean;
  onChangePage(page: number): void;
  page: number;
  rowsPerPage: number;
  setPage(page: number): void;
  setRowsPerPage(rowsPerPage: number): void;
  showTopPagination?: boolean;
  sx?: SxProps;
}

const Pagination = ({
  children,
  count,
  isLoading,
  onChangePage,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  showTopPagination = true,
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
    return `${from}-${to} ${t('pagination.of')} ${
      count !== -1 ? count : `${t('pagination.moreThan')} ${to}`
    }`;
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

  const renderPagination = (top = false) => {
    if (!showTopPagination && top) {
      return null;
    }
    return (
      <TablePagination
        component="div"
        count={count || 0}
        labelDisplayedRows={getDisplayedRowsLabel}
        labelRowsPerPage={isDesktop ? undefined : <></>}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        page={isLoading ? 0 : page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        SelectProps={selectProps}
        sx={{ marginBottom: top ? 1.5 : 0, ...sx }}
      />
    );
  };

  return (
    <>
      {renderPagination(true)}
      {children}
      {renderPagination()}
    </>
  );
};

export default Pagination;
