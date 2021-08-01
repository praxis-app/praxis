import { useState, useEffect } from "react";
import { useLazyQuery, useMutation, useReactiveVar } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { Tab, Tabs, Card, CircularProgress } from "@material-ui/core";

import Group from "../../components/Groups/Group";
import PostsList from "../../components/Posts/List";
import MotionsList from "../../components/Motions/List";
import Feed from "../../components/Shared/Feed";
import PostsForm from "../../components/Posts/Form";
import MotionsForm from "../../components/Motions/Form";
import ToggleForms from "../../components/Groups/ToggleForms";
import { GROUP_BY_NAME, GROUP_FEED } from "../../apollo/client/queries";
import {
  DELETE_GROUP,
  DELETE_POST,
  DELETE_MOTION,
} from "../../apollo/client/mutations";
import { feedVar, paginationVar } from "../../apollo/client/localState";
import { Common } from "../../constants";
import Messages from "../../utils/messages";
import { noCache } from "../../utils/apollo";
import { useCurrentUser, useMembersByGroupId } from "../../hooks";
import PageButtons from "../../components/Shared/PageButtons";

const Show = () => {
  const {
    query: { name },
  } = useRouter();
  const currentUser = useCurrentUser();
  const paginationState = useReactiveVar(paginationVar);
  const [group, setGroup] = useState<Group>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [motions, setMotions] = useState<Motion[]>([]);
  const [tab, setTab] = useState<number>(0);
  const [groupMembers] = useMembersByGroupId(group?.id);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME, noCache);
  const [getFeedRes, feedRes] = useLazyQuery(GROUP_FEED, noCache);
  const [deleteGroup] = useMutation(DELETE_GROUP);
  const [deleteMotion] = useMutation(DELETE_MOTION);
  const [deletePost] = useMutation(DELETE_POST);

  useEffect(() => {
    if (name) {
      getGroupRes({
        variables: { name },
      });
    }
  }, [name]);

  useEffect(() => {
    if (name && paginationState) {
      const { currentPage, pageSize } = paginationState;
      getFeedRes({
        variables: {
          name,
          pageSize,
          currentPage,
        },
      });
    }
  }, [name, paginationState]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

  useEffect(() => {
    if (feedRes.data) {
      setPosts(
        feedRes.data.groupFeed.pagedItems.filter(
          (item: FeedItem) => item.__typename === Common.TypeNames.Post
        )
      );
      setMotions(
        feedRes.data.groupFeed.pagedItems.filter(
          (item: FeedItem) => item.__typename === Common.TypeNames.Motion
        )
      );
    }
  }, [feedRes.data]);

  useEffect(() => {
    if (posts && motions && feedRes.data) {
      const items = [...posts, ...motions];
      feedVar({
        items,
        loading: feedRes.loading,
        totalItems: feedRes.data.groupFeed.totalItems,
      });
    }
    return () => {
      feedVar(null);
    };
  }, [posts, motions, feedRes.data]);

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

        <Card>
          <Tabs
            value={tab}
            onChange={(_event: React.ChangeEvent<any>, newValue: number) =>
              setTab(newValue)
            }
            textColor="inherit"
            centered
          >
            <Tab label={Messages.groups.tabs.all()} />
            <Tab label={Messages.groups.tabs.motions()} />
            <Tab label={Messages.groups.tabs.posts()} />
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
            <PageButtons />
            <Feed
              deleteMotion={deleteMotionHandler}
              deletePost={deletePostHandler}
            />
            <PageButtons bottom />
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
              loading={feedRes.loading}
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
              loading={feedRes.loading}
              deletePost={deletePostHandler}
            />
          </>
        )}
      </>
    );

  return <CircularProgress />;
};

export default Show;
