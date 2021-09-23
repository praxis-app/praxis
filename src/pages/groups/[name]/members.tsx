import Link from "next/link";
import { useRouter } from "next/router";
import { Card, CircularProgress, Typography } from "@material-ui/core";
import { truncate } from "lodash";

import Member from "../../../components/Groups/Member";
import Messages from "../../../utils/messages";
import {
  useGroupByName,
  useHasPermissionByGroupId,
  useMembersByGroupId,
} from "../../../hooks";
import {
  ResourcePaths,
  TruncationSizes,
  TypeNames,
} from "../../../constants/common";
import { GroupPermissions } from "../../../constants/role";

const Members = () => {
  const { query } = useRouter();
  const [group, _, groupLoading] = useGroupByName(query.name);
  const [groupMembers, setGroupMembers, groupMembersLoading] =
    useMembersByGroupId(group?.id);
  const [canKick, canKickLoading] = useHasPermissionByGroupId(
    GroupPermissions.KickMembers,
    group?.id
  );

  if (groupLoading || groupMembersLoading || canKickLoading)
    return <CircularProgress />;
  if (!group)
    return <Typography>{Messages.items.notFound(TypeNames.Group)}</Typography>;

  return (
    <>
      <Link href={`${ResourcePaths.Group}${query.name}`}>
        <a>
          <Typography variant="h3" color="primary">
            {truncate(query.name as string, {
              length: TruncationSizes.Medium,
            })}
          </Typography>
        </a>
      </Link>

      <Typography variant="h6" color="primary">
        {Messages.groups.members(groupMembers.length)}
      </Typography>

      <Card>
        {groupMembers.map((groupMember: ClientGroupMember) => {
          return (
            <Member
              groupMember={groupMember}
              groupMembers={groupMembers}
              setGroupMembers={setGroupMembers}
              canKickGroupMembers={canKick}
              key={groupMember.id}
            />
          );
        })}
      </Card>
    </>
  );
};

export default Members;
