import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { Card } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

import { FOLLOWING_BY_NAME } from "../../../apollo/client/queries";
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

const Following = () => {
  const { query } = useRouter();
  const [following, setFollowing] = useState([]);
  const followingRes = useQuery(FOLLOWING_BY_NAME, {
    variables: { name: query.name ? query.name : "" },
  });
  const classes = useStyles();

  useEffect(() => {
    setFollowing(
      followingRes.data ? followingRes.data.userFollowingByName : []
    );
  }, [followingRes.data]);

  return (
    <>
      <h1 style={{ color: "white" }}>{query.name}</h1>

      <h5 style={{ color: "white" }}>{following.length} Following</h5>

      <Card className={classes.root}>
        {following.map(({ userId }) => {
          return <Follow userId={userId} key={userId} />;
        })}
      </Card>
    </>
  );
};

export default Following;
