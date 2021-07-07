import React, { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Typography } from "@material-ui/core";

import { FOLLOWERS_BY_NAME } from "../../../apollo/client/queries";
import Follow from "../../../components/Follows/Follow";
import Messages from "../../../utils/messages";
import { noCache } from "../../../utils/apollo";

const Followers = () => {
  const { query } = useRouter();
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [getFollowersRes, followersRes] = useLazyQuery(
    FOLLOWERS_BY_NAME,
    noCache
  );

  useEffect(() => {
    if (query.name) {
      getFollowersRes({
        variables: { name: query.name },
      });
    }
  }, [query.name]);

  useEffect(() => {
    if (followersRes.data) setFollowers(followersRes.data.userFollowersByName);
  }, [followersRes.data]);

  return (
    <>
      <Link href={`/users/${query.name}`}>
        <a>
          <Typography variant="h3" color="primary">
            {query.name}
          </Typography>
        </a>
      </Link>

      <Typography variant="h6">
        {Messages.users.followers(followers.length)}
      </Typography>

      <Card>
        {followers.map(({ followerId }) => {
          return <Follow userId={followerId} key={followerId} />;
        })}
      </Card>
    </>
  );
};

export default Followers;
