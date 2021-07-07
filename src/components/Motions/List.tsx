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
      <>
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
      </>
    );

  return <CircularProgress />;
};

export default List;
