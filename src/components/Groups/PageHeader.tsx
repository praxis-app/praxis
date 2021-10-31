import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Card,
  CardContent as MUICardContent,
  CardHeader,
  createStyles,
  Divider,
  LinearProgress,
  Tab,
  Tabs,
  Typography,
  withStyles,
} from "@material-ui/core";
import { ChevronRight, HowToVote } from "@material-ui/icons";
import Router, { useRouter } from "next/router";
import Link from "next/link";

import {
  COVER_PHOTO_BY_GROUP_ID,
  MEMBER_REUQESTS,
} from "../../apollo/client/queries";
import { GroupSettings, SettingStates } from "../../constants/setting";
import {
  useCurrentUser,
  useHasPermissionByGroupId,
  useMembersByGroupId,
  useSettingsByGroupId,
} from "../../hooks";
import { WHITE } from "../../styles/Shared/theme";
import {
  NavigationPaths,
  ResourcePaths,
  TAB_QUERY_PARAM,
} from "../../constants/common";
import Messages from "../../utils/messages";
import JoinButton from "./JoinButton";
import { VotingTypes } from "../../constants/vote";
import { noCache, settingValue } from "../../utils/clientIndex";
import { GroupPermissions } from "../../constants/role";
import GroupItemMenu from "./ItemMenu";
import CoverPhoto from "../Images/CoverPhoto";
import { ItemMenuVariants } from "../Shared/ItemMenu";

export const enum GroupTabs {
  Motions = "motions",
  Events = "events",
  About = "about",
}

const CardContent = withStyles(() =>
  createStyles({
    root: {
      marginTop: 6,
      paddingBottom: 0,
    },
  })
)(MUICardContent);

const NameTypography = withStyles(() =>
  createStyles({
    root: {
      fontFamily: "Inter Bold",
      marginBottom: 6,
      maxWidth: "60%",
    },
  })
)(Typography);

interface Props {
  group: ClientGroup;
  deleteGroup: (id: string) => void;
  setTab: (tab: number) => void;
  tab: number;
}

const GroupPageHeader = ({ group, deleteGroup, setTab, tab }: Props) => {
  const { id, name } = group;
  const [groupSettings, _, groupSettingsLoading] = useSettingsByGroupId(id);
  const [groupMembers, setGroupMembers, groupMembersLoading] =
    useMembersByGroupId(group.id);
  const [coverPhoto, setCoverPhoto] = useState<ClientImage>();
  const [memberRequests, setMemberRequests] = useState<ClientMemberRequest[]>(
    []
  );
  const currentUser = useCurrentUser();
  const memberVariables = {
    variables: { groupId: group.id },
    ...noCache,
  };
  const memberRequestsRes = useQuery(MEMBER_REUQESTS, memberVariables);
  const coverPhotoRes = useQuery(COVER_PHOTO_BY_GROUP_ID, {
    variables: { groupId: group.id },
    ...noCache,
  });
  const [canEdit] = useHasPermissionByGroupId(GroupPermissions.EditGroup, id);
  const [canDelete] = useHasPermissionByGroupId(
    GroupPermissions.DeleteGroup,
    id
  );
  const [canManageRoles] = useHasPermissionByGroupId(
    GroupPermissions.ManageRoles,
    id
  );
  const [canManageSettings] = useHasPermissionByGroupId(
    GroupPermissions.ManageSettings,
    id
  );
  const [canAcceptMemberRequests] = useHasPermissionByGroupId(
    GroupPermissions.AcceptMemberRequests,
    id
  );

  const { query } = useRouter();
  const groupPagePath = `${ResourcePaths.Group}${name}`;
  const motionsTabPath = `${groupPagePath}${TAB_QUERY_PARAM}${GroupTabs.Motions}`;
  const eventsTabPath = `${groupPagePath}${TAB_QUERY_PARAM}${GroupTabs.Events}`;
  const aboutTabPath = `${groupPagePath}${TAB_QUERY_PARAM}${GroupTabs.About}`;

  useEffect(() => {
    if (coverPhotoRes.data)
      setCoverPhoto(coverPhotoRes.data.coverPhotoByGroupId);
  }, [coverPhotoRes.data]);

  useEffect(() => {
    if (memberRequestsRes.data)
      setMemberRequests(memberRequestsRes.data.memberRequests);
  }, [memberRequestsRes.data]);

  useEffect(() => {
    if (query.tab)
      switch (query.tab) {
        case GroupTabs.Motions:
          setTab(1);
          break;
        case GroupTabs.Events:
          setTab(2);
          break;
        case GroupTabs.About:
          setTab(3);
      }
  }, [query.tab]);

  const isNoAdmin = (): boolean => {
    return (
      settingValue(GroupSettings.NoAdmin, groupSettings) === SettingStates.On
    );
  };

  const isAMember = (): boolean => {
    const member = groupMembers?.find(
      (member: ClientGroupMember) => member.userId === currentUser?.id
    );
    return Boolean(member);
  };

  const canSeeRequests = (): boolean => {
    if (canAcceptMemberRequests) return true;
    if (isNoAdmin() && isAMember()) return true;
    return false;
  };

  const votingType = (): string => {
    const setting = settingValue(GroupSettings.VotingType, groupSettings);
    const votingTypes = Messages.groups.votingTypeLabels;
    switch (setting) {
      case VotingTypes.Majority:
        return votingTypes.majority();
      case VotingTypes.XToPass:
        return votingTypes.xToPass();
      default:
        return votingTypes.consensus();
    }
  };

  const showItemMenu =
    currentUser &&
    !isNoAdmin() &&
    (canEdit || canDelete || canManageSettings || canManageRoles);

  if (
    memberRequestsRes.loading ||
    coverPhotoRes.loading ||
    groupSettingsLoading ||
    groupMembersLoading
  )
    return (
      <Card>
        <LinearProgress />
      </Card>
    );

  return (
    <Card>
      <CoverPhoto path={coverPhoto?.path} />

      {(showItemMenu || currentUser) && (
        <CardHeader
          action={
            <>
              {currentUser && (
                <JoinButton
                  group={group}
                  memberRequests={memberRequests}
                  groupMembers={groupMembers}
                  setMemberRequests={setMemberRequests}
                  setGroupMembers={setGroupMembers}
                />
              )}

              {showItemMenu && (
                <GroupItemMenu
                  group={group}
                  deleteGroup={deleteGroup}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  canManageRoles={canManageRoles}
                  canManageSettings={canManageSettings}
                  variant={ItemMenuVariants.Ghost}
                />
              )}
            </>
          }
          style={{ marginTop: 12 }}
        />
      )}

      <CardContent>
        <Link href={`${groupPagePath}${NavigationPaths.About}`}>
          <a>
            <NameTypography
              variant="h5"
              color="primary"
              style={{
                marginTop: showItemMenu ? -80 : -72,
              }}
            >
              {group.name}
              <ChevronRight style={{ marginBottom: -4 }} />
            </NameTypography>
          </a>
        </Link>

        <Link href={`${groupPagePath}${NavigationPaths.About}`}>
          <a>
            <HowToVote
              fontSize="small"
              style={{ marginBottom: -3, marginRight: "0.3ch" }}
            />
            {votingType() + Messages.middotWithSpaces()}
          </a>
        </Link>

        <Link href={`${groupPagePath}${NavigationPaths.Members}`}>
          <a>{Messages.groups.members(groupMembers.length)}</a>
        </Link>

        {canSeeRequests() && Boolean(memberRequests.length) && (
          <>
            <span style={{ color: WHITE }}>{Messages.middotWithSpaces()}</span>

            <Link href={`${groupPagePath}${NavigationPaths.Requests}`}>
              <a>{Messages.groups.requests(memberRequests.length)}</a>
            </Link>
          </>
        )}

        <Divider style={{ marginTop: 18 }} />
      </CardContent>

      <Tabs
        value={tab}
        onChange={(_event: React.ChangeEvent<any>, newValue: number) =>
          setTab(newValue)
        }
        textColor="inherit"
        centered
      >
        <Tab
          label={Messages.groups.tabs.feed()}
          onClick={() => Router.push(groupPagePath)}
        />
        <Tab
          label={Messages.groups.tabs.motions()}
          onClick={() => Router.push(motionsTabPath)}
        />
        <Tab
          label={Messages.groups.tabs.events()}
          onClick={() => Router.push(eventsTabPath)}
        />
        <Tab
          label={Messages.groups.tabs.about()}
          onClick={() => Router.push(aboutTabPath)}
        />
      </Tabs>
    </Card>
  );
};

export default GroupPageHeader;
