import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { Avatar, CircularProgress } from "@material-ui/core";
import { Group } from "@material-ui/icons";
import Link from "next/link";

import { COVER_PHOTO_BY_GROUP_ID } from "../../apollo/client/queries";
import { ResourcePaths } from "../../constants/common";
import { BLACK, WHITE } from "../../styles/Shared/theme";
import { noCache, baseUrl } from "../../utils/clientIndex";

interface Props {
  group: ClientGroup;
}

const GroupAvatar = ({ group }: Props) => {
  const [coverPhoto, setCoverPhoto] = useState<ClientImage>();
  const { data: coverPhotoData, loading: coverPhotoLoading } = useQuery(
    COVER_PHOTO_BY_GROUP_ID,
    {
      variables: { groupId: group.id },
      ...noCache,
    }
  );

  useEffect(() => {
    if (coverPhotoData) setCoverPhoto(coverPhotoData.coverPhotoByGroupId);
  }, [coverPhotoData]);

  return (
    <Link href={`${ResourcePaths.Group}${group.name}`}>
      <a>
        <Avatar
          style={{
            backgroundColor: coverPhoto || coverPhotoLoading ? BLACK : WHITE,
            color: BLACK,
          }}
          src={baseUrl + coverPhoto?.path}
        >
          {coverPhotoLoading ? <CircularProgress size={10} /> : <Group />}
        </Avatar>
      </a>
    </Link>
  );
};

export default GroupAvatar;
