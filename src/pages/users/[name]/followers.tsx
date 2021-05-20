import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core/styles";

import { FOLLOWERS_BY_NAME } from "../../../apollo/client/queries";
import Follow from "../../../components/Follows/Follow";

import styles from "../../../styles/Follow/Follow.module.scss";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
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
    if (followersRes.data) setFollowers(followersRes.data.userFollowersByName);
  }, [followersRes.data]);

  return (
    <>
      <Link href={`/users/${query.name}`}>
        <a>
          <h1 style={{ color: "white" }}>{query.name}</h1>
        </a>
      </Link>

      <h5 style={{ color: "white" }}>{followers.length} Followers</h5>

      <Card className={classes.root + " " + styles.card}>
        {followers.map(({ followerId }) => {
          return <Follow userId={followerId} key={followerId} />;
        })}
      </Card>
    </>
  );
};

export default Followers;
