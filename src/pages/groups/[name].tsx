import { useState, useEffect } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import Router, { useRouter } from "next/router";
import {
  Tab,
  Tabs,
  Card,
  makeStyles,
  CircularProgress,
} from "@material-ui/core";

import Group from "../../components/Groups/Group";
import PostsList from "../../components/Posts/List";
import MotionsList from "../../components/Motions/List";
import Feed from "../../components/Shared/Feed";
import PostsForm from "../../components/Posts/Form";
import MotionsForm from "../../components/Motions/Form";
import ToggleForms from "../../components/Groups/ToggleForms";
import {
  GROUP_BY_NAME,
  GROUP_FEED,
  GROUP_MEMBERS,
} from "../../apollo/client/queries";
import {
  DELETE_GROUP,
  DELETE_POST,
  DELETE_MOTION,
} from "../../apollo/client/mutations";
import { feedItemsVar } from "../../apollo/client/localState";
import styles from "../../styles/Group/ShowPage.module.scss";
import { Common } from "../../constants";
import Messages from "../../utils/messages";
import { noCache } from "../../utils/apollo";
import { useCurrentUser } from "../../hooks";

const useStyles = makeStyles({
  root: {
    backgroundColor: "rgb(65, 65, 65)",
  },
  title: {
    fontFamily: "Inter",
  },
  indicator: {
    backgroundColor: "white",
  },
});

const Show = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [group, setGroup] = useState<Group>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [motions, setMotions] = useState<Motion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<number>(0);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME, noCache);
  const [getFeedRes, feedRes] = useLazyQuery(GROUP_FEED, noCache);
  const [getGroupMembersRes, groupMembersRes] = useLazyQuery(
    GROUP_MEMBERS,
    noCache
  );
  const [deleteGroup] = useMutation(DELETE_GROUP);
  const [deleteMotion] = useMutation(DELETE_MOTION);
  const [deletePost] = useMutation(DELETE_POST);
  const classes = useStyles();

  useEffect(() => {
    const vars = {
      variables: { name: query.name },
    };
    if (query.name) {
      getGroupRes(vars);
      getFeedRes(vars);
    }
  }, [query.name]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

  useEffect(() => {
    if (feedRes.data) {
      feedItemsVar(feedRes.data.groupFeed);
      setPosts(
        feedRes.data.groupFeed.filter(
          (item: FeedItem) => item.__typename === Common.TypeNames.Post
        )
      );
      setMotions(
        feedRes.data.groupFeed.filter(
          (item: FeedItem) => item.__typename === Common.TypeNames.Motion
        )
      );
      setLoading(false);
    }
    return () => {
      feedItemsVar([]);
    };
  }, [feedRes.data]);

  useEffect(() => {
    if (groupMembersRes.data)
      setGroupMembers(groupMembersRes.data.groupMembers);
  }, [groupMembersRes.data]);

  useEffect(() => {
    feedItemsVar([...posts, ...motions]);
    return () => {
      feedItemsVar([]);
    };
  }, [posts, motions]);

  useEffect(() => {
    if (group) {
      getGroupMembersRes({
        variables: {
          groupId: group.id,
        },
      });
    }
  }, [group]);

  const deleteGroupHandler = async (groupId: string) => {
    await deleteGroup({
      variables: {
        id: groupId,
      },
    });
    Router.push("/groups");
  };

  const deletePostHandler = async (id: string) => {
    await deletePost({
      variables: {
        id,
      },
    });
    setPosts(posts.filter((post: Post) => post.id !== id));
  };

  const deleteMotionHandler = async (id: string) => {
    await deleteMotion({
      variables: {
        id,
      },
    });
    setMotions(motions.filter((motion: Motion) => motion.id !== id));
  };

  const inThisGroup = (): boolean => {
    if (!currentUser) return false;
    return !!groupMembers.find((member) => member.userId === currentUser.id);
  };

  if (group)
    return (
      <>
        <Group group={group} deleteGroup={deleteGroupHandler} />

        <Card className={classes.root + " " + styles.card}>
          <Tabs
            textColor="inherit"
            centered
            value={tab}
            onChange={(_event: React.ChangeEvent<any>, newValue: number) =>
              setTab(newValue)
            }
            classes={{ indicator: classes.indicator }}
          >
            <Tab
              label={Messages.groups.tabs.all()}
              style={{ color: "white" }}
            />
            <Tab
              label={Messages.groups.tabs.motions()}
              style={{ color: "white" }}
            />
            <Tab
              label={Messages.groups.tabs.posts()}
              style={{ color: "white" }}
            />
          </Tabs>
        </Card>

        {tab === 0 && (
          <>
            {inThisGroup() && (
              <ToggleForms
                posts={posts}
                motions={motions}
                setPosts={setPosts}
                setMotions={setMotions}
                group={group}
              />
            )}
            <Feed
              deleteMotion={deleteMotionHandler}
              deletePost={deletePostHandler}
              loading={loading}
            />
          </>
        )}

        {tab === 1 && (
          <>
            {inThisGroup() && (
              <MotionsForm
                motions={motions}
                setMotions={setMotions}
                group={group}
              />
            )}
            <MotionsList
              motions={motions}
              loading={loading}
              deleteMotion={deleteMotionHandler}
            />
          </>
        )}

        {tab === 2 && (
          <>
            {inThisGroup() && (
              <PostsForm posts={posts} setPosts={setPosts} group={group} />
            )}
            <PostsList
              posts={posts}
              loading={loading}
              deletePost={deletePostHandler}
            />
          </>
        )}
      </>
    );

  return <CircularProgress style={{ color: "white" }} />;
};

export default Show;
