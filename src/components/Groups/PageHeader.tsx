import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Card,
  CardActions as MUICardActions,
  CardContent as MUICardContent,
  CardHeader,
  CircularProgress,
  createStyles,
  MenuItem,
  Typography,
  withStyles,
} from "@material-ui/core";
import { ChevronRight, HowToVote, Settings } from "@material-ui/icons";
import Image from "material-ui-image";
import Link from "next/link";

import {
  CURRENT_COVER_PHOTO,
  MEMBER_REUQESTS,
} from "../../apollo/client/queries";
import { GroupSettings, SettingStates } from "../../constants/setting";
import {
  useCurrentUser,
  useIsMobile,
  useMembersByGroupId,
  useSettingsByGroupId,
} from "../../hooks";
import baseUrl from "../../utils/baseUrl";
import { BLACK, WHITE } from "../../styles/Shared/theme";
import {
  ModelNames,
  NavigationPaths,
  ResourcePaths,
} from "../../constants/common";
import Messages from "../../utils/messages";
import ItemMenu from "../Shared/ItemMenu";
import JoinButton from "./JoinButton";
import { VotingTypes } from "../../constants/vote";
import { noCache, settingValueByName } from "../../utils/clientIndex";

const CardContent = withStyles(() =>
  createStyles({
    root: { marginTop: 6, paddingBottom: 0 },
  })
)(MUICardContent);

const CardActions = withStyles(() =>
  createStyles({
    root: {
      justifyContent: "flex-end",
      paddingTop: 0,
    },
  })
)(MUICardActions);

interface Props {
  group: ClientGroup;
  deleteGroup: (id: string) => void;
}

const GroupPageHeader = ({ group, deleteGroup }: Props) => {
  const { id, name, creatorId } = group;
  const [groupSettings, _, groupSettingsLoading] = useSettingsByGroupId(id);
  const [groupMembers, setGroupMembers, groupMembersLoading] =
    useMembersByGroupId(group.id);
  const [coverPhoto, setCoverPhoto] = useState<ClientImage>();
  const [memberRequests, setMemberRequests] = useState<ClientMemberRequest[]>(
    []
  );
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const currentUser = useCurrentUser();
  const memberVariables = {
    variables: { groupId: group.id },
    ...noCache,
  };
  const memberRequestsRes = useQuery(MEMBER_REUQESTS, memberVariables);
  const coverPhotoRes = useQuery(CURRENT_COVER_PHOTO, {
    variables: { groupId: group.id },
    ...noCache,
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    if (coverPhotoRes.data) setCoverPhoto(coverPhotoRes.data.currentCoverPhoto);
  }, [coverPhotoRes.data]);

  useEffect(() => {
    if (memberRequestsRes.data)
      setMemberRequests(memberRequestsRes.data.memberRequests);
  }, [memberRequestsRes.data]);

  const isCreator = (): boolean => {
    if (currentUser) return currentUser.id === creatorId;
    return false;
  };

  const isNoAdmin = (): boolean => {
    return (
      settingValueByName(GroupSettings.NoAdmin, groupSettings) ===
      SettingStates.On
    );
  };

  const isAMember = (): boolean => {
    const member = groupMembers?.find(
      (member: ClientGroupMember) => member.userId === currentUser?.id
    );
    return Boolean(member);
  };

  const canSeeRequests = (): boolean => {
    if (isCreator()) return true;
    if (isNoAdmin() && isAMember()) return true;
    return false;
  };

  const votingType = (): string => {
    const setting = settingValueByName(GroupSettings.VotingType, groupSettings);
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

  if (
    memberRequestsRes.loading ||
    coverPhotoRes.loading ||
    groupSettingsLoading ||
    groupMembersLoading
  )
    return <CircularProgress />;

  return (
    <Card>
      {isCreator() && !isNoAdmin() && (
        <CardHeader
          action={
            currentUser &&
            !isNoAdmin() && (
              <ItemMenu
                itemId={id}
                name={group.name}
                itemType={ModelNames.Group}
                anchorEl={menuAnchorEl}
                setAnchorEl={setMenuAnchorEl}
                deleteItem={deleteGroup}
                ownItem={() => isCreator()}
              >
                <Link href={`${ResourcePaths.Group}${group.name}/settings`}>
                  <a>
                    <MenuItem>
                      <Settings
                        fontSize="small"
                        style={{
                          marginRight: "5",
                        }}
                      />
                      {Messages.groups.settings.name()}
                    </MenuItem>
                  </a>
                </Link>
              </ItemMenu>
            )
          }
          style={{ paddingBottom: 6 }}
        />
      )}

      <Image
        src={(baseUrl + coverPhoto?.path) as string}
        aspectRatio={isMobile ? 2 : 2.75}
        cover={true}
        color={BLACK}
        disableSpinner
        disableError
      />

      <CardContent>
        <Link href={`${ResourcePaths.Group}${name}${NavigationPaths.About}`}>
          <a>
            <Typography
              variant="h5"
              color="primary"
              style={{ fontFamily: "Inter Bold", marginBottom: 6 }}
            >
              {group.name}
              <ChevronRight style={{ marginBottom: -4 }} />
            </Typography>
          </a>
        </Link>

        <Link href={`${ResourcePaths.Group}${name}${NavigationPaths.About}`}>
          <a>
            <HowToVote
              fontSize="small"
              style={{ marginBottom: -3, marginRight: "0.3ch" }}
            />
            {votingType() + Messages.middotWithSpaces()}
          </a>
        </Link>

        <Link href={`${ResourcePaths.Group}${name}${NavigationPaths.Members}`}>
          <a>{Messages.groups.members(groupMembers.length)}</a>
        </Link>

        {canSeeRequests() && Boolean(memberRequests.length) && (
          <>
            <span style={{ color: WHITE }}>{Messages.middotWithSpaces()}</span>

            <Link
              href={`${ResourcePaths.Group}${name}${NavigationPaths.Requests}`}
            >
              <a>{Messages.groups.requests(memberRequests.length)}</a>
            </Link>
          </>
        )}
      </CardContent>

      {currentUser && (
        <CardActions>
          <JoinButton
            group={group}
            memberRequests={memberRequests}
            groupMembers={groupMembers}
            setMemberRequests={setMemberRequests}
            setGroupMembers={setGroupMembers}
          />
        </CardActions>
      )}
    </Card>
  );
};

export default GroupPageHeader;
