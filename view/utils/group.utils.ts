import { GroupTabs } from '../components/Groups/GroupProfileCard';
import {
  NavigationPaths,
  TAB_QUERY_PARAM,
} from '../constants/shared.constants';

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
