import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Canary } from '../canaries/models/canary.model';
import { Comment } from '../comments/models/comment.model';
import { EventAttendee } from '../events/models/event-attendee.model';
import { Event } from '../events/models/event.model';
import { GroupRolePermission } from '../groups/group-roles/models/group-role-permission.model';
import { GroupRole } from '../groups/group-roles/models/group-role.model';
import { GroupConfig } from '../groups/models/group-config.model';
import { GroupMemberRequest } from '../groups/models/group-member-request.model';
import { Group } from '../groups/models/group.model';
import { Image } from '../images/models/image.model';
import { Like } from '../likes/models/like.model';
import { Notification } from '../notifications/models/notification.model';
import { Post } from '../posts/models/post.model';
import { ProposalConfig } from '../proposals/models/proposal-config.model';
import { Proposal } from '../proposals/models/proposal.model';
import { ProposalActionEventHost } from '../proposals/proposal-actions/models/proposal-action-event-host.model';
import { ProposalActionEvent } from '../proposals/proposal-actions/models/proposal-action-event.model';
import { ProposalActionGroupConfig } from '../proposals/proposal-actions/models/proposal-action-group-config.model';
import { ProposalActionPermission } from '../proposals/proposal-actions/models/proposal-action-permission.model';
import { ProposalActionRoleMember } from '../proposals/proposal-actions/models/proposal-action-role-member.model';
import { ProposalActionRole } from '../proposals/proposal-actions/models/proposal-action-role.model';
import { ProposalAction } from '../proposals/proposal-actions/models/proposal-action.model';
import { Rule } from '../rules/models/rule.model';
import { ServerConfig } from '../server-configs/models/server-config.model';
import { ServerInvite } from '../server-invites/models/server-invite.model';
import { ServerRolePermission } from '../server-roles/models/server-role-permission.model';
import { ServerRole } from '../server-roles/models/server-role.model';
import { User } from '../users/models/user.model';
import { Answer } from '../vibe-check/models/answer.model';
import { Question } from '../vibe-check/models/question.model';
import { QuestionnaireTicketConfig } from '../vibe-check/models/questionnaire-ticket-config.model';
import { QuestionnaireTicket } from '../vibe-check/models/questionnaire-ticket.model';
import { ServerQuestion } from '../vibe-check/models/server-question.model';
import { Vote } from '../votes/models/vote.model';
import { Initial1675388391336 } from './migrations/1675388391336-Initial';
import { AddServerInviteTable1677339785709 } from './migrations/1677339785709-AddServerInviteTable';
import { AddLikeTable1679157357262 } from './migrations/1679157357262-AddLikeTable';
import { AddFollowTable1679778147216 } from './migrations/1679778147216-AddFollowTable';
import { AddGroupMemberLinkTable1681010227367 } from './migrations/1681010227367-AddGroupMemberLinkTable';
import { DropGroupMemberEntityTable1681010509841 } from './migrations/1681010509841-DropGroupMemberEntityTable';
import { AddRoleMemberLinkTable1681172948650 } from './migrations/1681172948650-AddRoleMemberLinkTable';
import { DropRoleMemberEntityTable1681173025669 } from './migrations/1681173025669-DropRoleMemberEntityTable';
import { AddProposalActionRoleTable1684893300206 } from './migrations/1684893300206-AddProposalActionRoleTable';
import { AddProposalActionImagesConstraint1685201083917 } from './migrations/1685201083917-AddProposalActionImagesConstraint';
import { AddGroupConfigTable1685746618239 } from './migrations/1685746618239-AddGroupConfigTable';
import { AddProposalActionRoleCascadeDelete1685748700121 } from './migrations/1685748700121-AddProposalActionRoleCascadeDelete';
import { RefactorRolesAndPermissions1688001951695 } from './migrations/1688001951695-RefactorRolesAndPermissions';
import { RenameGroupMemberRequestTable1688348341669 } from './migrations/1688348341669-RenameGroupMemberRequestTable';
import { AddEventTables1690147636077 } from './migrations/1690147636077-AddEventTables';
import { CleanUpGroupMemberRequestTable1690168731029 } from './migrations/1690168731029-CleanUpGroupMemberRequestTable';
import { SetDefaultForGroupMemberRequestTable1690333204053 } from './migrations/1690333204053-SetDefaultForGroupMemberRequestTable';
import { RemoveMemberRequestIdSeq1690336764201 } from './migrations/1690336764201-RemoveMemberRequestIdSeq';
import { AddCommentTable1693003196421 } from './migrations/1693003196421-AddCommentTable';
import { GroupMemberRequestCleanUp1694647639797 } from './migrations/1694647639797-GroupMemberRequestCleanUp';
import { AddProposalActionEventTables1694657129939 } from './migrations/1694657129939-AddProposalActionEventTables';
import { AddServerConfigTable1699135846939 } from './migrations/1699135846939-AddServerConfigTable';
import { AddCanaryTable1699136722535 } from './migrations/1699136722535-AddCanaryTable';
import { RemoveRefreshTokenTable1699815961902 } from './migrations/1699815961902-RemoveRefreshTokenTable';
import { AddProposalActionGroupConfigTable1700964923516 } from './migrations/1700964923516-AddProposalActionGroupConfigTable';
import { AddGroupConfigColumns1701548819916 } from './migrations/1701548819916-AddGroupConfigColumns';
import { AddSecurityTxtColumn1702684900226 } from './migrations/1702684900226-AddSecurityTxtColumn';
import { AddProposalConfigTable1702843109428 } from './migrations/1702843109428-AddProposalConfigTable';
import { UpdateVotingTimeLimitDefault1703118466924 } from './migrations/1703118466924-UpdateVotingTimeLimitDefault';
import { AddAdminModelColumns1703454648429 } from './migrations/1703454648429-AddAdminModelColumns';
import { AddServerRolePermissionColumns1703978999070 } from './migrations/1703978999070-AddServerRolePermissionColumns';
import { AddCascadeDeletesForUser1704254669247 } from './migrations/1704254669247-AddCascadeDeletesForUser';
import { AddNotificationsTable1704767517224 } from './migrations/1704767517224-AddNotificationsTable';
import { AddNotificationRelationColumns1705026747368 } from './migrations/1705026747368-AddNotificationRelationColumns';
import { AddRuleTable1705711560882 } from './migrations/1705711560882-AddRuleTable';
import { AddVibeCheckTables1709004638886 } from './migrations/1709004638886-AddVibeCheckTables';
import { AddInitialMemberCountColumn1709498470199 } from './migrations/1709498470199-AddInitialMemberCountColumn';
import { AddUserLockedColumn1711324242919 } from './migrations/1711324242919-AddUserLockedColumn';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  database: process.env.DB_SCHEMA,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT as string),
  entities: [
    Answer,
    Canary,
    Comment,
    Event,
    EventAttendee,
    Group,
    GroupConfig,
    GroupMemberRequest,
    GroupRole,
    GroupRolePermission,
    Image,
    Like,
    Notification,
    Post,
    Proposal,
    ProposalAction,
    ProposalActionEvent,
    ProposalActionEventHost,
    ProposalActionGroupConfig,
    ProposalActionPermission,
    ProposalActionRole,
    ProposalActionRoleMember,
    ProposalConfig,
    Question,
    QuestionnaireTicket,
    QuestionnaireTicketConfig,
    Rule,
    ServerConfig,
    ServerInvite,
    ServerQuestion,
    ServerRole,
    ServerRolePermission,
    User,
    Vote,
  ],
  migrations: [
    AddAdminModelColumns1703454648429,
    AddCanaryTable1699136722535,
    AddCascadeDeletesForUser1704254669247,
    AddCommentTable1693003196421,
    AddEventTables1690147636077,
    AddFollowTable1679778147216,
    AddGroupConfigColumns1701548819916,
    AddGroupConfigTable1685746618239,
    AddGroupMemberLinkTable1681010227367,
    AddInitialMemberCountColumn1709498470199,
    AddLikeTable1679157357262,
    AddNotificationRelationColumns1705026747368,
    AddNotificationsTable1704767517224,
    AddProposalActionEventTables1694657129939,
    AddProposalActionGroupConfigTable1700964923516,
    AddProposalActionImagesConstraint1685201083917,
    AddProposalActionRoleCascadeDelete1685748700121,
    AddProposalActionRoleTable1684893300206,
    AddProposalConfigTable1702843109428,
    AddRoleMemberLinkTable1681172948650,
    AddRuleTable1705711560882,
    AddSecurityTxtColumn1702684900226,
    AddServerConfigTable1699135846939,
    AddServerInviteTable1677339785709,
    AddServerRolePermissionColumns1703978999070,
    AddUserLockedColumn1711324242919,
    AddVibeCheckTables1709004638886,
    CleanUpGroupMemberRequestTable1690168731029,
    DropGroupMemberEntityTable1681010509841,
    DropRoleMemberEntityTable1681173025669,
    GroupMemberRequestCleanUp1694647639797,
    Initial1675388391336,
    RefactorRolesAndPermissions1688001951695,
    RemoveMemberRequestIdSeq1690336764201,
    RemoveRefreshTokenTable1699815961902,
    RenameGroupMemberRequestTable1688348341669,
    SetDefaultForGroupMemberRequestTable1690333204053,
    UpdateVotingTimeLimitDefault1703118466924,
  ],
});
