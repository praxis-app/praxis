import { useReactiveVar } from "@apollo/client";
import { useEffect } from "react";
import {
  createStyles,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { NavigateNext, NavigateBefore } from "@material-ui/icons";

import { paginationVar, feedVar } from "../../apollo/client/localState";
import styles from "../../styles/Shared/PageButtons.module.scss";
import Messages from "../../utils/messages";
import { Common } from "../../constants";

const useStyles = makeStyles(() =>
  createStyles({
    sequenceTextRoot: {
      paddingTop: 8,
      paddingRight: 10,
    },
  })
);

interface Props {
  bottom?: boolean;
}

const PageButtons = ({ bottom = false }: Props) => {
  const paginationState = useReactiveVar(paginationVar);
  const feedState = useReactiveVar(feedVar);
  const classes = useStyles();

  useEffect(() => {
    paginationVar({
      currentPage: Common.Pagination.FirstPage,
      pageSize: Common.Pagination.DefaultPageSize,
    });

    return () => {
      paginationVar(null);
    };
  }, []);

  const handleButtonClick = (next = true) => {
    if (paginationState && feedState) {
      const { totalItems } = feedState;
      const { currentPage, pageSize } = paginationState;
      const totalPages = Math.ceil(totalItems / pageSize);
      const newCurrentPage = next ? currentPage + 1 : currentPage - 1;
      const canTurnPage =
        (!next && currentPage > 0) || (next && currentPage < totalPages - 1);

      if (canTurnPage)
        paginationVar({
          ...paginationState,
          currentPage: newCurrentPage,
        });
    }
  };

  const sequenceText = (): string => {
    if (paginationState && feedState) {
      const { totalItems } = feedState;
      const { currentPage, pageSize } = paginationState;
      const start = currentPage * pageSize + 1;
      let end = (currentPage + 1) * pageSize;
      if (end > totalItems) end = totalItems;

      return `${start}-${end} of ${totalItems}`;
    }
    return Messages.states.loading();
  };

  const onFirstPage = (): boolean => {
    const currentPage = paginationState?.currentPage;
    return currentPage === 0;
  };

  const onLastPage = (): boolean => {
    if (paginationState && feedState) {
      const { totalItems } = feedState;
      const { currentPage, pageSize } = paginationState;
      const totalPages = Math.ceil(totalItems / pageSize);

      return currentPage === totalPages - 1;
    }
    return false;
  };

  if (bottom && feedState?.loading) return <></>;

  return (
    <div className={styles.container}>
      <Typography classes={{ root: classes.sequenceTextRoot }} color="primary">
        {sequenceText()}
      </Typography>

      <IconButton
        onClick={() => handleButtonClick(false)}
        disabled={onFirstPage()}
        size="small"
      >
        <NavigateBefore
          color={onFirstPage() ? "disabled" : "primary"}
          fontSize="large"
        />
      </IconButton>

      <IconButton
        onClick={() => handleButtonClick()}
        disabled={onLastPage()}
        size="small"
      >
        <NavigateNext
          color={onLastPage() ? "disabled" : "primary"}
          fontSize="large"
        />
      </IconButton>
    </div>
  );
};

export default PageButtons;
