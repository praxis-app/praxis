import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Typography } from "@material-ui/core";

import { FOLLOWING_BY_NAME } from "../../../apollo/client/queries";
import Follow from "../../../components/Follows/Follow";
import Messages from "../../../utils/messages";
import { ResourcePaths } from "../../../constants/common";

const Following = () => {
  const { query } = useRouter();
  const [following, setFollowing] = useState([]);
  const [getFollowingRes, followingRes] = useLazyQuery(FOLLOWING_BY_NAME, {
    variables: { name: query.name ? query.name : "" },
  });

  useEffect(() => {
    if (query.name) {
      getFollowingRes({
        variables: { name: query.name },
      });
    }
  }, [query.name]);

  useEffect(() => {
    setFollowing(
      followingRes.data ? followingRes.data.userFollowingByName : []
    );
  }, [followingRes.data]);

  return (
    <>
      <Link href={`${ResourcePaths.User}${query.name}`}>
        <a>
          <Typography variant="h3" color="primary">
            {query.name}
          </Typography>
        </a>
      </Link>

      <Typography variant="h6" color="primary">
        {Messages.users.following(following.length)}
      </Typography>

      <Card>
        {following.map(({ userId }) => {
          return <Follow userId={userId} key={userId} />;
        })}
      </Card>
    </>
  );
};

export default Following;
