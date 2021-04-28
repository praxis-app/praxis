import { CircularProgress } from "@material-ui/core";
import Motion from "./Motion";

interface Props {
  motions: Motion[];
  loading: boolean;
  deleteMotion: (id: string) => void;
}

const List = ({ motions, loading, deleteMotion }: Props) => {
  if (!loading)
    return (
      <div style={{ marginBottom: "200px" }}>
        {motions
          .slice()
          .reverse()
          .map((motion) => {
            return (
              <Motion
                motion={motion}
                deleteMotion={deleteMotion}
                key={motion.id}
              />
            );
          })}
      </div>
    );

  return <CircularProgress style={{ color: "white" }} />;
};

export default List;
