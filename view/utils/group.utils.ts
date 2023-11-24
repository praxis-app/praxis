import { ApolloCache, FetchResult } from '@apollo/client';
import { produce } from 'immer';
import { GroupTabs } from '../constants/group.constants';
import {
  NavigationPaths,
  TAB_QUERY_PARAM,
  TypeNames,
} from '../constants/shared.constants';
import { toastVar } from '../graphql/cache';
import { DeleteGroupMutation } from '../graphql/groups/mutations/gen/DeleteGroup.gen';
import {
  GroupsDocument,
  GroupsQuery,
} from '../graphql/groups/queries/gen/Groups.gen';

export const removeGroup =
  (id: number) =>
  (cache: ApolloCache<any>, { errors }: FetchResult<DeleteGroupMutation>) => {
    if (errors) {
      toastVar({ status: 'error', title: errors[0].message });
      return;
    }
    cache.updateQuery<GroupsQuery>({ query: GroupsDocument }, (groupsData) =>
      produce(groupsData, (draft) => {
        if (!draft) {
          return;
        }
        const index = draft.groups.findIndex((p) => p.id === id);
        draft.groups.splice(index, 1);
      }),
    );
    const cacheId = cache.identify({ id, __typename: TypeNames.Group });
    cache.evict({ id: cacheId });
    cache.gc();
  };

export const getGroupPath = (groupName: string) =>
  `${NavigationPaths.Groups}/${groupName}`;

export const getGroupEventsTabPath = (groupName: string) => {
  const groupPath = getGroupPath(groupName);
  return `${groupPath}${TAB_QUERY_PARAM}${GroupTabs.Events}`;
};

export const getMemberRequestsPath = (groupName: string) => {
  const groupPath = getGroupPath(groupName);
  return `${groupPath}/requests`;
};

export const getGroupMembersPath = (groupName: string) => {
  const groupPath = getGroupPath(groupName);
  return `${groupPath}/members`;
};

export const getEditGroupPath = (groupName: string) => {
  const groupPath = getGroupPath(groupName);
  return `${groupPath}${NavigationPaths.Edit}`;
};
