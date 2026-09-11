import { api } from '@/client/api-client';
import { SERVER_PERMISSION_KEYS } from '@/constants/role.constants';
import { useServerData } from '@/hooks/use-server-data';
import { useAuthStore } from '@/store/auth.store';
import { type PollActionRes } from '@/types/poll-action.types';
import { type ServerPermissionKeys } from '@/types/role.types';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ProposalActionAccordion } from './proposal-action-accordion';
import {
  ProposalActionChange,
  ProposalActionChangeValue,
  ProposalActionColorValue,
  ProposalActionMemberValue,
} from './proposal-action-change';

export const ACCORDION_ITEM_VALUE = 'role-change-proposal';

export const ProposalActionRole = ({ action }: { action: PollActionRes }) => {
  const { serverId } = useServerData();
  const { inviteToken } = useAuthStore();
  const { t } = useTranslation();

  const { data: serverRoleData } = useQuery({
    queryKey: [
      'servers',
      serverId,
      'roles',
      action.serverRole?.serverRoleId,
      ...(inviteToken ? ['invite', inviteToken] : []),
    ],
    queryFn: () => {
      if (!action.serverRole?.serverRoleId || !serverId) {
        throw new Error('Server role ID is required');
      }
      return api.getServerRole(serverId, action.serverRole.serverRoleId);
    },
    enabled: !!action.serverRole?.serverRoleId && !!serverId,
  });

  if (!action.serverRole) {
    return null;
  }

  const role = action.serverRole;
  const currentRole = serverRoleData?.serverRole;
  const permissionChanges = SERVER_PERMISSION_KEYS.flatMap((name) => {
    const permissions = role.permissions ?? [];
    const matches = (() => {
      switch (name) {
        case 'manageChannels':
          return permissions.filter(
            (permission) =>
              permission.subject === 'Channel' &&
              permission.action.includes('manage'),
          );
        case 'manageServerSettings':
          return permissions.filter(
            (permission) =>
              permission.subject === 'ServerConfig' &&
              permission.action.includes('manage'),
          );
        case 'manageServerRoles':
          return permissions.filter(
            (permission) =>
              permission.subject === 'ServerRole' &&
              permission.action.includes('manage'),
          );
        case 'createInvites':
          return permissions.filter(
            (permission) =>
              permission.subject === 'Invite' &&
              (permission.action.includes('read') ||
                permission.action.includes('create')),
          );
        case 'manageInvites':
          return permissions.filter(
            (permission) =>
              permission.subject === 'Invite' &&
              permission.action.includes('manage'),
          );
        case 'blockProposals':
          return permissions.filter(
            (permission) =>
              permission.subject === 'ProposalBlock' &&
              permission.action.includes('create'),
          );
      }
    })();

    if (!matches.length || (name === 'createInvites' && matches.length < 2)) {
      return [];
    }
    return [{ name, changeType: matches[0].changeType }];
  });

  const oldName = role.prevName ?? currentRole?.name ?? role.name;
  const oldColor = role.prevColor ?? currentRole?.color ?? role.color;
  const summaryName = action.actionType === 'change-role' ? oldName : role.name;
  const summaryColor =
    action.actionType === 'change-role' ? oldColor : role.color;

  return (
    <ProposalActionAccordion
      value={ACCORDION_ITEM_VALUE}
      summary={
        <>
          {t(
            action.actionType === 'change-role'
              ? 'proposals.labels.roleChangeProposal'
              : 'proposals.labels.roleProposal',
          )}
          :{' '}
          {summaryColor && (
            <span
              className="mr-1 inline-block size-3.5 rounded-full align-[-1px]"
              style={{ backgroundColor: summaryColor }}
            />
          )}
          <span className="font-normal">{summaryName}</span>
        </>
      }
    >
      {role.name && role.name !== oldName && (
        <ProposalActionChange
          label={t('proposals.labels.name')}
          oldValue={oldName}
          proposedValue={role.name}
        />
      )}

      {role.color && role.color !== oldColor && (
        <ProposalActionChange
          label={t('proposals.labels.color')}
          oldValue={<ProposalActionColorValue color={oldColor} />}
          proposedValue={<ProposalActionColorValue color={role.color} />}
        />
      )}

      {!!permissionChanges.length && (
        <div className="min-w-0 space-y-2">
          <div className="font-medium">
            {t('proposals.headers.permissions')}
          </div>
          {permissionChanges.map((permission) => (
            <ProposalActionChangeValue
              key={permission.name}
              changeType={permission.changeType}
            >
              {t(
                `permissions.names.${permission.name as ServerPermissionKeys}`,
              )}
            </ProposalActionChangeValue>
          ))}
        </div>
      )}

      {!!role.members?.length && (
        <div className="min-w-0 space-y-2">
          <div className="font-medium">
            {t('proposals.headers.memberChanges')}
          </div>
          {role.members.map((member) => (
            <ProposalActionChangeValue
              key={member.user.id}
              changeType={member.changeType}
            >
              <ProposalActionMemberValue user={member.user} />
            </ProposalActionChangeValue>
          ))}
        </div>
      )}
    </ProposalActionAccordion>
  );
};
