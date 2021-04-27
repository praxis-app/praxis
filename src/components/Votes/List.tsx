import { CircularProgress } from "@material-ui/core";
import Vote from "./Vote";

interface Props {
  votes: Vote[];
  setVotes: (votes: Vote[]) => void;
}

const List = ({ votes, setVotes }: Props) => {
  if (votes)
    return (
      <div style={{ marginBottom: "200px" }}>
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
      </div>
    );

  return <CircularProgress style={{ color: "white" }} />;
};

export default List;
