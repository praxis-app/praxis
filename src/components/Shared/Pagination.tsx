// This component was built before we were aware of the MUI TablePagination component: https://material-ui.com/components/pagination/#table-pagination
// Please migrate to MUIs pagination component if this component gives any serious issues going forward.

import { useReactiveVar } from "@apollo/client";
import { useEffect } from "react";
import {
  IconButton,
  Typography,
  NativeSelect,
  makeStyles,
  Theme,
  createStyles,
} from "@material-ui/core";
import { NavigateNext, NavigateBefore } from "@material-ui/icons";

import { paginationVar, feedVar } from "../../apollo/client/localState";
import styles from "../../styles/Shared/Pagination.module.scss";
import Messages from "../../utils/messages";
import { Common } from "../../constants";

const useStyles = makeStyles((theme: Theme) => {
  const hideForMobile = {
    [theme.breakpoints.down(Common.DESKTOP_BREAKPOINT)]: {
      display: "none",
    },
  };
  const contrastColor = {
    color: theme.palette.primary.contrastText,
  };

  return createStyles({
    root: hideForMobile,
    select: contrastColor,
    icon: {
      ...contrastColor,
      ...hideForMobile,
    },
  });
});

interface Props {
  bottom?: boolean;
}

const PageButtons = ({ bottom = false }: Props) => {
  const paginationState = useReactiveVar(paginationVar);
  const { totalItems, loading: feedLoading } = useReactiveVar(feedVar);
  const { currentPage, pageSize } = paginationState;
  const classes = useStyles();

  useEffect(() => {
    return () => {
      paginationVar(Common.DEFAULT_PAGINATION_STATE);
    };
  }, []);

  const handleButtonClick = (next = true) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const newCurrentPage = next ? currentPage + 1 : currentPage - 1;
    const canTurnPage =
      (!next && currentPage > 0) || (next && currentPage < totalPages - 1);

    if (canTurnPage)
      paginationVar({
        ...paginationState,
        currentPage: newCurrentPage,
      });
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    paginationVar({
      ...paginationState,
      pageSize: parseInt(event.target.value),
    });
  };

  const sequenceText = (): string => {
    if (feedLoading) return Messages.states.loading();
    if (!totalItems) return "";

    const start = currentPage * pageSize + 1;
    let end = (currentPage + 1) * pageSize;
    if (end > totalItems) end = totalItems;

    return `${start}-${end} of ${totalItems}`;
  };

  const onFirstPage = (): boolean => {
    const currentPage = paginationState.currentPage;
    return currentPage === 0;
  };

  const onLastPage = (): boolean => {
    const totalPages = Math.ceil(totalItems / pageSize);
    return currentPage === totalPages - 1;
  };

  const isDisabled = (next = true): boolean => {
    if (feedLoading) return true;
    if (next) return onLastPage();
    return onFirstPage();
  };

  if ((bottom && feedLoading) || !totalItems) return <></>;

  return (
    <div className={styles.container}>
      <NativeSelect
        value={pageSize}
        onChange={handlePageSizeChange}
        classes={classes}
        disableUnderline
      >
        <option value={Common.PageSizes.Min}>
          {Messages.pagination.rowsPerPage(Common.PageSizes.Min)}
        </option>
        <option value={Common.PageSizes.Default}>
          {Messages.pagination.rowsPerPage(Common.PageSizes.Default)}
        </option>
        <option value={Common.PageSizes.Max}>
          {Messages.pagination.rowsPerPage(Common.PageSizes.Max)}
        </option>
      </NativeSelect>

      <Typography className={styles.sequenceText} color="primary">
        {sequenceText()}
      </Typography>

      <IconButton
        onClick={() => handleButtonClick(false)}
        disabled={isDisabled(false)}
        size="small"
      >
        <NavigateBefore
          color={isDisabled(false) ? "disabled" : "primary"}
          fontSize="large"
        />
      </IconButton>

      <IconButton
        onClick={() => handleButtonClick()}
        disabled={isDisabled()}
        size="small"
      >
        <NavigateNext
          color={isDisabled() ? "disabled" : "primary"}
          fontSize="large"
        />
      </IconButton>
    </div>
  );
};

interface PaginationProps {
  children?: React.ReactChild;
}

const Pagination = ({ children }: PaginationProps) => {
  return (
    <>
      <PageButtons />
      {children}
      <PageButtons bottom />
    </>
  );
};

export default Pagination;
