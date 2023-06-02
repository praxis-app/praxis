import { config } from "dotenv";
import { DataSource } from "typeorm";
import { RefreshToken } from "../auth/refresh-tokens/models/refresh-token.model";
import { GroupConfig } from "../groups/group-configs/models/group-config.model";
import { MemberRequest } from "../groups/member-requests/models/member-request.model";
import { Group } from "../groups/models/group.model";
import { Image } from "../images/models/image.model";
import { Like } from "../likes/models/like.model";
import { Post } from "../posts/models/post.model";
import { Proposal } from "../proposals/models/proposal.model";
import { ProposalAction } from "../proposals/proposal-actions/models/proposal-action.model";
import { ProposalActionPermission } from "../proposals/proposal-actions/proposal-action-roles/models/proposal-action-permission.model";
import { ProposalActionRoleMember } from "../proposals/proposal-actions/proposal-action-roles/models/proposal-action-role-member.model";
import { ProposalActionRole } from "../proposals/proposal-actions/proposal-action-roles/models/proposal-action-role.model";
import { Role } from "../roles/models/role.model";
import { Permission } from "../roles/permissions/models/permission.model";
import { ServerInvite } from "../server-invites/models/server-invite.model";
import { User } from "../users/models/user.model";
import { Vote } from "../votes/models/vote.model";
import { Initial1675388391336 } from "./migrations/1675388391336-Initial";
import { AddServerInviteTable1677339785709 } from "./migrations/1677339785709-AddServerInviteTable";
import { AddLikeTable1679157357262 } from "./migrations/1679157357262-AddLikeTable";
import { AddFollowTable1679778147216 } from "./migrations/1679778147216-AddFollowTable";
import { AddGroupMemberLinkTable1681010227367 } from "./migrations/1681010227367-AddGroupMemberLinkTable";
import { DropGroupMemberEntityTable1681010509841 } from "./migrations/1681010509841-DropGroupMemberEntityTable";
import { AddRoleMemberLinkTable1681172948650 } from "./migrations/1681172948650-AddRoleMemberLinkTable";
import { DropRoleMemberEntityTable1681173025669 } from "./migrations/1681173025669-DropRoleMemberEntityTable";
import { AddProposalActionRoleTable1684893300206 } from "./migrations/1684893300206-AddProposalActionRoleTable";
import { AddProposalActionImagesConstraint1685201083917 } from "./migrations/1685201083917-AddProposalActionImagesConstraint";
import { AddGroupConfigTable1685746618239 } from "./migrations/1685746618239-AddGroupConfigTable";
import { AddProposalActionRoleCascadeDelete1685748700121 } from "./migrations/1685748700121-AddProposalActionRoleCascadeDelete";

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
    GroupConfig,
    Image,
    Like,
    MemberRequest,
    Permission,
    Post,
    Proposal,
    ProposalAction,
    ProposalActionPermission,
    ProposalActionRole,
    ProposalActionRoleMember,
    RefreshToken,
    Role,
    ServerInvite,
    User,
    Vote,
  ],
  migrations: [
    AddFollowTable1679778147216,
    AddGroupConfigTable1685746618239,
    AddGroupMemberLinkTable1681010227367,
    AddLikeTable1679157357262,
    AddProposalActionImagesConstraint1685201083917,
    AddProposalActionRoleCascadeDelete1685748700121,
    AddProposalActionRoleTable1684893300206,
    AddRoleMemberLinkTable1681172948650,
    AddServerInviteTable1677339785709,
    DropGroupMemberEntityTable1681010509841,
    DropRoleMemberEntityTable1681173025669,
    Initial1675388391336,
  ],
});
