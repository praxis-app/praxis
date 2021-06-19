import React, { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Typography } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core/styles";

import { FOLLOWERS_BY_NAME } from "../../../apollo/client/queries";
import Follow from "../../../components/Follows/Follow";

import styles from "../../../styles/Follow/Follow.module.scss";
import Messages from "../../../utils/messages";

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
          <Typography variant="h3" style={{ fontSize: 40 }}>
            {query.name}
          </Typography>
        </a>
      </Link>

      <Typography variant="h6" style={{ marginBottom: 6, color: "white" }}>
        {Messages.users.followers(followers.length)}
      </Typography>

      <Card className={classes.root + " " + styles.card}>
        {followers.map(({ followerId }) => {
          return <Follow userId={followerId} key={followerId} />;
        })}
      </Card>
    </>
  );
};

export default Followers;
