import { config } from "dotenv";
import { DataSource } from "typeorm";
import { RefreshToken } from "../auth/refresh-tokens/models/refresh-token.model";
import { MemberRequest } from "../groups/member-requests/models/member-request.model";
import { Group } from "../groups/models/group.model";
import { Image } from "../images/models/image.model";
import { Like } from "../likes/models/like.model";
import { Post } from "../posts/models/post.model";
import { Proposal } from "../proposals/models/proposal.model";
import { ProposalAction } from "../proposals/proposal-actions/models/proposal-action.model";
import { Role } from "../roles/models/role.model";
import { Permission } from "../roles/permissions/models/permission.model";
import { RoleMember } from "../roles/role-members/models/role-member.model";
import { ServerInvite } from "../server-invites/models/server-invite.model";
import { User } from "../users/models/user.model";
import { Vote } from "../votes/models/vote.model";
import { Initial1675388391336 } from "./migrations/1675388391336-Initial";
import { AddServerInviteTable1677339785709 } from "./migrations/1677339785709-AddServerInviteTable";
import { AddLikeTable1679157357262 } from "./migrations/1679157357262-AddLikeTable";
import { AddFollowTable1679778147216 } from "./migrations/1679778147216-AddFollowTable";
import { AddGroupMemberLinkTable1681010227367 } from "./migrations/1681010227367-AddGroupMemberLinkTable";
import { DropGroupMemberEntityTable1681010509841 } from "./migrations/1681010509841-DropGroupMemberEntityTable";

config();

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  database: process.env.DB_SCHEMA,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT as string),
  entities: [
    Group,
    Image,
    Like,
    MemberRequest,
    Permission,
    Post,
    Proposal,
    ProposalAction,
    RefreshToken,
    Role,
    RoleMember,
    ServerInvite,
    User,
    Vote,
  ],
  migrations: [
    AddFollowTable1679778147216,
    AddGroupMemberLinkTable1681010227367,
    AddLikeTable1679157357262,
    AddServerInviteTable1677339785709,
    DropGroupMemberEntityTable1681010509841,
    Initial1675388391336,
  ],
});
