import { Circle } from '@mui/icons-material';
import {
  Box,
  BoxProps,
  Divider,
  Grid,
  SxProps,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ProposalActionType } from '../../../constants/proposal.constants';
import {
  ProposalActionRoleInput,
  ProposalActionRoleMemberInput,
} from '../../../graphql/gen';
import { useGroupRoleByRoleIdLazyQuery } from '../../../graphql/groups/queries/gen/GroupRoleByRoleId.gen';
import { ProposalActionRoleFragment } from '../../../graphql/proposals/fragments/gen/ProposalActionRole.gen';
import { useUsersByIdsLazyQuery } from '../../../graphql/users/queries/gen/UsersByIds.gen';
import { useIsDesktop } from '../../../hooks/shared.hooks';
import { cleanPermissions } from '../../../utils/role.utils';
import { getTypedKeys } from '../../../utils/shared.utils';
import Accordion, {
  AccordionDetails,
  AccordionSummary,
} from '../../Shared/Accordion';
import ProgressBar from '../../Shared/ProgressBar';
import ChangeDelta from './ChangeDelta';
import ProposalActionPermission from './ProposalActionPermission';
import ProposalActionRoleMember from './ProposalActionRoleMember';

type ArrayElement<ArrayType extends unknown[] | undefined | null> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type RoleMember =
  | ProposalActionRoleMemberInput
  | ArrayElement<ProposalActionRoleFragment['members']>;

interface Props extends Omit<BoxProps, 'role'> {
  role: ProposalActionRoleFragment | ProposalActionRoleInput;
  actionType: ProposalActionType;
  isShared?: boolean;
  preview?: boolean;
  ratified?: boolean;
}

// TODO: Rename as ProposedRole
const ProposalActionRole = ({
  actionType,
  isShared,
  preview,
  ratified,
  role,
  ...boxProps
}: Props) => {
  const { pathname } = useLocation();
  const isProposalPage = pathname.includes('/proposals/');
  const [showRole, setShowRole] = useState(!!preview || isProposalPage);

  const [
    getSelectedRole,
    {
      data: selectedRoleData,
      loading: selectedRoleLoading,
      error: selectedRoleError,
    },
  ] = useGroupRoleByRoleIdLazyQuery();

  const [
    getSelectedUsers,
    {
      data: selectedUsersData,
      loading: selectedUsersLoading,
      error: selectedUsersError,
    },
  ] = useUsersByIdsLazyQuery();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  // Fetch data required for preview in ProposalForm
  useEffect(() => {
    if (!preview || 'id' in role || !role.members) {
      return;
    }
    const userIds = role.members.map(
      (member: ProposalActionRoleMemberInput) => member.userId,
    );
    getSelectedUsers({
      variables: { userIds },
    });
    if ('roleToUpdateId' in role && role.roleToUpdateId) {
      getSelectedRole({
        variables: { id: role.roleToUpdateId },
      });
    }
  }, [preview, getSelectedUsers, getSelectedRole, role]);

  if (selectedRoleError || selectedUsersError) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (selectedRoleLoading || selectedUsersLoading) {
    return <ProgressBar />;
  }

  const { name, color, permissions, members } = role;
  const roleToChange =
    'groupRole' in role ? role.groupRole : selectedRoleData?.groupRole;

  const oldName =
    ratified && 'oldName' in role ? role.oldName : roleToChange?.name;
  const oldColor =
    ratified && 'oldColor' in role ? role.oldColor : roleToChange?.color;

  const isRoleChange = actionType === ProposalActionType.ChangeRole;
  const isAddingRole = actionType === ProposalActionType.CreateRole;
  const isChangingName = isRoleChange && name && name !== oldName;
  const isChangingColor = isRoleChange && color && color !== oldColor;

  const includedPermissions = cleanPermissions(permissions) || {};
  const includedPermissionNames = getTypedKeys(includedPermissions);
  const hasPermissions = !!includedPermissionNames.length;

  const accordionSummary = isAddingRole
    ? t('proposals.labels.roleProposal')
    : t('proposals.labels.roleChangeProposal');

  const accordionStyles: SxProps = {
    backgroundColor: isShared ? undefined : 'rgb(0, 0, 0, 0.1)',
    borderRadius: 2,
    paddingX: 2,
  };
  const circleIconStyles: SxProps = {
    color: isChangingColor ? oldColor : color,
    marginTop: 0.5,
    fontSize: 16,
  };
  const colorChangeIconStyles: SxProps = {
    ...circleIconStyles,
    fontSize: 14,
    marginRight: '0.8ch',
    marginTop: 0.4,
  };

  const getRoleNameTextWidth = () => {
    if (isDesktop) {
      if (isRoleChange) {
        return '330px';
      }
      return '390px';
    }

    if (isRoleChange) {
      return '80px';
    }
    return '120px';
  };

  return (
    <Box marginBottom={preview || isShared ? 0 : 2.5} {...boxProps}>
      <Accordion
        expanded={showRole}
        onChange={() => setShowRole(!showRole)}
        sx={accordionStyles}
      >
        <AccordionSummary>
          <Typography marginRight="0.5ch" fontFamily="Inter Bold">
            {accordionSummary}:
          </Typography>
          <Circle sx={{ ...circleIconStyles, marginRight: '0.5ch' }} />
          <Box
            component="span"
            display="inline-block"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            width={getRoleNameTextWidth()}
          >
            {isChangingName ? oldName : name}
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ marginBottom: isDesktop ? 2 : 3 }}>
          {!isRoleChange && !members?.length && !hasPermissions && (
            <Typography>
              {t('proposals.prompts.emptyPermsAndMembers')}
            </Typography>
          )}

          <Grid
            columns={isDesktop ? 12 : 4}
            columnSpacing={3}
            rowSpacing={1}
            container
          >
            {isRoleChange && (
              <>
                {isChangingName && (
                  <ChangeDelta
                    label={t('proposals.labels.name')}
                    proposedValue={name}
                    oldValue={oldName}
                  />
                )}

                {isChangingColor && (
                  <ChangeDelta
                    label={t('proposals.labels.color')}
                    proposedValue={color}
                    oldValue={oldColor}
                    oldValueIcon={<Circle sx={colorChangeIconStyles} />}
                    proposedValueIcon={
                      <Circle sx={{ ...colorChangeIconStyles, color }} />
                    }
                  />
                )}
              </>
            )}

            {hasPermissions && (
              <Grid item xs={!isRoleChange ? 5 : 6}>
                <Typography fontFamily="Inter Bold" fontSize={15} gutterBottom>
                  {t('permissions.labels.permissions')}
                </Typography>

                {includedPermissionNames.map((permissionName) => (
                  <ProposalActionPermission
                    key={permissionName}
                    actionType={actionType}
                    permissionName={permissionName}
                    permissions={includedPermissions}
                  />
                ))}
              </Grid>
            )}

            {!isRoleChange && hasPermissions && !!members?.length && (
              <Grid item xs={isDesktop ? 1.25 : 12}>
                <Divider
                  orientation={isDesktop ? 'vertical' : 'horizontal'}
                  sx={{
                    marginTop: isDesktop ? 0.6 : 1,
                    marginBottom: isDesktop ? 0 : 1,
                  }}
                />
              </Grid>
            )}

            {!!members?.length && (
              <Grid item xs={!isRoleChange ? 5.75 : 6}>
                <Typography fontFamily="Inter Bold" fontSize={15} gutterBottom>
                  {t('roles.labels.members')}
                </Typography>

                {members.map((member: RoleMember) => (
                  <ProposalActionRoleMember
                    key={'id' in member ? member.id : member.userId}
                    selectedUsers={selectedUsersData?.usersByIds}
                    actionType={actionType}
                    member={member}
                  />
                ))}
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {isShared && (
        <Divider sx={{ marginX: 2, marginBottom: showRole ? 1.5 : 1 }} />
      )}
    </Box>
  );
};

export default ProposalActionRole;
