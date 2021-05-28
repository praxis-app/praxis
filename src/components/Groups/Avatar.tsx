import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { Avatar } from "@material-ui/core";
import Link from "next/link";

import baseUrl from "../../utils/baseUrl";
import { CURRENT_COVER_PHOTO } from "../../apollo/client/queries";
import Messages from "../../utils/messages";

interface Props {
  group: Group;
}

const GroupAvatar = ({ group }: Props) => {
  const [coverPhoto, setCoverPhoto] = useState<Image>();

  const coverPhotoRes = useQuery(CURRENT_COVER_PHOTO, {
    variables: { groupId: group.id },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (coverPhotoRes.data) setCoverPhoto(coverPhotoRes.data.currentCoverPhoto);
  }, [coverPhotoRes.data]);

  return (
    <Link href={`/groups/${group.name}`}>
      <a>
        <Avatar
          style={{
            backgroundColor: coverPhoto ? "black" : "white",
            color: "black",
          }}
        >
          {coverPhoto ? (
            <img
              src={baseUrl + coverPhoto.path}
              alt={Messages.images.couldNotRender()}
              style={{
                width: "100%",
              }}
            />
          ) : (
            <>{group.name[0].charAt(0).toUpperCase()}</>
          )}
        </Avatar>
      </a>
    </Link>
  );
};

export default GroupAvatar;
