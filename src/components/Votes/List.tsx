import { CircularProgress } from "@material-ui/core";
import Vote from "./Vote";

interface Props {
  votes: ClientVote[];
  setVotes: (votes: ClientVote[]) => void;
}

const List = ({ votes, setVotes }: Props) => {
  if (votes)
    return (
      <>
        {votes
          .slice()
          .reverse()
          .map((vote) => {
            if (vote.body)
              return (
                <Vote
                  vote={vote}
                  votes={votes}
                  setVotes={setVotes}
                  key={vote.id}
                />
              );
          })}
      </>
    );

  return <CircularProgress />;
};

export default List;
