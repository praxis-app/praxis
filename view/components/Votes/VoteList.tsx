import { Divider, SxProps } from '@mui/material';
import { Fragment } from 'react';
import Vote from './Vote/Vote';
import { VoteFragment } from './Vote/generated/Vote.fragment';

interface Props {
  votes: VoteFragment[];
}

const VoteList = ({ votes }: Props) => {
  const getDividerStyles = (index: number) => {
    const styles: SxProps = {
      marginY: 1.5,
      marginLeft: 7.5,
    };
    if (votes.length === 1 || index === votes.length - 1) {
      return { ...styles, display: 'none' };
    }
    return styles;
  };

  return (
    <>
      {votes.map((vote, index) => (
        <Fragment key={vote.id}>
          <Vote vote={vote} />
          <Divider sx={getDividerStyles(index)} />
        </Fragment>
      ))}
    </>
  );
};

export default VoteList;
