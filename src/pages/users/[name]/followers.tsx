import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { Card } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

import { FOLLOWERS_BY_NAME } from "../../../apollo/client/queries";
import Follow from "../../../components/Follows/Follow";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 330,
      marginBottom: 12,
      backgroundColor: "rgb(65, 65, 65)",
    },
  })
);

const Followers = () => {
  const { query } = useRouter();
  const [followers, setFollowers] = useState([]);
  const [getFollowersRes, followersRes] = useLazyQuery(FOLLOWERS_BY_NAME);
  const classes = useStyles();

  useEffect(() => {
    if (query.name) {
      getFollowersRes({
        variables: { name: query.name },
      });
    }
  }, [query.name]);

  useEffect(() => {
    setFollowers(
      followersRes.data ? followersRes.data.userFollowersByName : []
    );
  }, [followersRes.data]);

  return (
    <>
      <h1 style={{ color: "white" }}>{query.name}</h1>

      <h5 style={{ color: "white" }}>{followers.length} Followers</h5>

      <Card className={classes.root}>
        {followers.map(({ followerId }) => {
          return <Follow userId={followerId} key={followerId} />;
        })}
      </Card>
    </>
  );
};

export default Followers;
