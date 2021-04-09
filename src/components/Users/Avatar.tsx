import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { Avatar } from "@material-ui/core";

import baseUrl from "../../utils/baseUrl";
import { CURRENT_PROFILE_PICTURE } from "../../apollo/client/queries";

interface Props {
  user: User;
}

const UserAvatar = ({ user }: Props) => {
  const [profilePicture, setProfilePicture] = useState<Image>();

  const profilePictureRes = useQuery(CURRENT_PROFILE_PICTURE, {
    variables: { userId: user.id },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (profilePictureRes.data)
      setProfilePicture(profilePictureRes.data.currentProfilePicture);
  }, [profilePictureRes.data]);

  return (
    <Avatar
      style={{
        backgroundColor: profilePicture ? "black" : "white",
        color: "black",
      }}
    >
      {profilePicture ? (
        <img
          src={baseUrl + profilePicture.path}
          alt="Data could not render."
          style={{
            width: "100%",
          }}
        />
      ) : (
        <>{user.name[0].charAt(0).toUpperCase()}</>
      )}
    </Avatar>
  );
};

export default UserAvatar;
