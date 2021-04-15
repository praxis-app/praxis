import { useState, useEffect } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { Spinner } from "react-bootstrap";

import Group from "../../components/Groups/Group";
import PostsList from "../../components/Posts/List";
import PostForm from "../../components/Posts/Form";
import {
  GROUP_BY_NAME,
  POSTS_BY_GROUP_NAME,
  GROUP_MEMBERS,
  CURRENT_USER,
} from "../../apollo/client/queries";
import { DELETE_GROUP, DELETE_POST } from "../../apollo/client/mutations";
import { isLoggedIn } from "../../utils/auth";

const Show = () => {
  const { query } = useRouter();
  const [group, setGroup] = useState<Group>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);
  const [getPostsRes, postsRes] = useLazyQuery(POSTS_BY_GROUP_NAME, {
    fetchPolicy: "no-cache",
  });
  const currentUserRes = useQuery(CURRENT_USER);
  const [getGroupMembersRes, groupMembersRes] = useLazyQuery(GROUP_MEMBERS, {
    fetchPolicy: "no-cache",
  });
  const [deleteGroup] = useMutation(DELETE_GROUP);
  const [deletePost] = useMutation(DELETE_POST);

  useEffect(() => {
    const vars = {
      variables: { name: query.name },
    };
    if (query.name) {
      getGroupRes(vars);
      getPostsRes(vars);
    }
  }, [query.name]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

  useEffect(() => {
    if (postsRes.data) setPosts(postsRes.data.postsByGroupName);
  }, [postsRes.data]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  useEffect(() => {
    if (group)
      getGroupMembersRes({
        variables: {
          groupId: group.id,
        },
      });
  }, [group]);

  useEffect(() => {
    if (groupMembersRes.data)
      setGroupMembers(groupMembersRes.data.groupMembers);
  }, [groupMembersRes.data]);

  const deleteGroupHandler = async (groupId: string) => {
    try {
      await deleteGroup({
        variables: {
          id: groupId,
        },
      });
      Router.push("/groups");
    } catch {}
  };

  const deletePostHandler = async (id: string) => {
    try {
      await deletePost({
        variables: {
          id: id,
        },
      });
      // Removes deleted post from state
      setPosts(posts.filter((post: Post) => post.id !== id));
    } catch {}
  };

  const inThisGroup = (): boolean => {
    if (!isLoggedIn(currentUser) || !currentUser) return false;
    return !!groupMembers.find((member) => member.userId === currentUser.id);
  };

  return (
    <>
      {group ? (
        <>
          <Group group={group} deleteGroup={deleteGroupHandler} />

          {inThisGroup() && (
            <>
              {isLoggedIn(currentUser) && (
                <PostForm posts={posts} setPosts={setPosts} group={group} />
              )}
              <PostsList posts={posts} deletePost={deletePostHandler} />
            </>
          )}
        </>
      ) : (
        <Spinner animation="border" />
      )}
    </>
  );
};

export default Show;
