import { Avatar, CircularProgress } from "@material-ui/core";
import { Event as EventIcon } from "@material-ui/icons";
import Link from "next/link";

import { ResourcePaths } from "../../constants/common";
import { BLACK, WHITE } from "../../styles/Shared/theme";
import { baseUrl } from "../../utils/clientIndex";
import { useCoverPhotoByEventId } from "../../hooks";

interface Props {
  event: ClientEvent;
}

const EventAvatar = ({ event: { id } }: Props) => {
  const [coverPhoto, _, coverPhotoLoading] = useCoverPhotoByEventId(id);
  return (
    <Link href={`${ResourcePaths.Event}${id}`}>
      <a>
        <Avatar
          style={{
            backgroundColor: coverPhoto || coverPhotoLoading ? BLACK : WHITE,
            color: BLACK,
          }}
          src={baseUrl + coverPhoto?.path}
        >
          {coverPhotoLoading ? <CircularProgress size={10} /> : <EventIcon />}
        </Avatar>
      </a>
    </Link>
  );
};

export default EventAvatar;
