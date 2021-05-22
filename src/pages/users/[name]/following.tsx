import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core/styles";

import { FOLLOWING_BY_NAME } from "../../../apollo/client/queries";
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

const Following = () => {
  const { query } = useRouter();
  const [following, setFollowing] = useState([]);
  const [getFollowingRes, followingRes] = useLazyQuery(FOLLOWING_BY_NAME, {
    variables: { name: query.name ? query.name : "" },
  });
  const classes = useStyles();

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
      <Link href={`/users/${query.name}`}>
        <a>
          <h1 style={{ color: "white" }}>{query.name}</h1>
        </a>
      </Link>

      <h5 style={{ color: "white" }}>
        {Messages.users.following(following.length)}
      </h5>

      <Card className={classes.root + " " + styles.card}>
        {following.map(({ userId }) => {
          return <Follow userId={userId} key={userId} />;
        })}
      </Card>
    </>
  );
};

export default Following;
