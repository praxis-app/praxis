import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { Avatar } from "@material-ui/core";
import Link from "next/link";

import baseUrl from "../../utils/baseUrl";
import { CURRENT_COVER_PHOTO } from "../../apollo/client/queries";
import { ResourcePaths } from "../../constants/common";
import { BLACK, WHITE } from "../../styles/Shared/theme";
import { noCache } from "../../utils/clientIndex";
import { Group } from "@material-ui/icons";

interface Props {
  group: ClientGroup;
}

const GroupAvatar = ({ group }: Props) => {
  const [coverPhoto, setCoverPhoto] = useState<ClientImage>();

  const coverPhotoRes = useQuery(CURRENT_COVER_PHOTO, {
    variables: { groupId: group.id },
    ...noCache,
  });

  useEffect(() => {
    if (coverPhotoRes.data) setCoverPhoto(coverPhotoRes.data.currentCoverPhoto);
  }, [coverPhotoRes.data]);

  return (
    <Link href={`${ResourcePaths.Group}${group.name}`}>
      <a>
        <Avatar
          style={{
            backgroundColor: coverPhoto ? BLACK : WHITE,
            color: BLACK,
          }}
          src={baseUrl + coverPhoto?.path}
        >
          <Group />
        </Avatar>
      </a>
    </Link>
  );
};

export default GroupAvatar;
