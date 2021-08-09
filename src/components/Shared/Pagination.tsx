// This component was built before we were aware of the MUI TablePagination component: https://material-ui.com/components/pagination/#table-pagination
// Please migrate to MUIs pagination component if this component gives any serious issues going forward.

import { useReactiveVar } from "@apollo/client";
import { useEffect, useState } from "react";
import {
  IconButton,
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Select,
  MenuItem,
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

const PageButtons = ({ bottom }: Props) => {
  const paginationState = useReactiveVar(paginationVar);
  const { totalItems, loading: feedLoading } = useReactiveVar(feedVar);
  const { currentPage, pageSize } = paginationState;
  const [selectOpen, setSelectOpen] = useState<boolean>(false);
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
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    paginationVar({
      ...paginationState,
      pageSize: parseInt(event.target.value as string),
      currentPage: 0,
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

  const isHiding = (): boolean => {
    if (bottom && feedLoading) return true;
    if (!feedLoading && !totalItems) return true;
    return false;
  };

  if (isHiding()) return <></>;

  return (
    <div className={styles.container}>
      <Typography
        onClick={() => setSelectOpen(!selectOpen)}
        className={styles.rowsPerPageText}
        classes={{ root: classes.root }}
        color="primary"
      >
        {Messages.pagination.rowsPerPage()}
      </Typography>

      <Select
        value={pageSize}
        onChange={handlePageSizeChange}
        onClick={() => setSelectOpen(!selectOpen)}
        classes={classes}
        disableUnderline
        open={selectOpen}
      >
        {[
          Common.PageSizes.Min,
          Common.PageSizes.Default,
          Common.PageSizes.Max,
        ].map((_pageSize) => (
          <MenuItem value={_pageSize} key={_pageSize}>
            {_pageSize}
          </MenuItem>
        ))}
      </Select>

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
