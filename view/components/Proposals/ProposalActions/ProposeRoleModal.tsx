import {
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { Form, Formik } from 'formik';
import {
  ChangeEvent,
  ReactNode,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react';
import { ColorResult } from 'react-color';
import { useTranslation } from 'react-i18next';
import {
  ProposalActionFieldName,
  ProposeRoleModalFieldName,
} from '../../../constants/proposal.constants';
import {
  DEFAULT_ROLE_COLOR,
  GROUP_PERMISSION_NAMES,
  SERVER_PERMISSION_NAMES,
} from '../../../constants/role.constants';
import { FieldNames } from '../../../constants/shared.constants';
import {
  ProposalActionRoleInput,
  ProposalActionRoleMemberInput,
  ProposalActionType,
} from '../../../graphql/gen';
import { useGroupMembersByGroupIdLazyQuery } from '../../../graphql/groups/queries/gen/GroupMembersByGroupId.gen';
import { useGroupRoleByRoleIdLazyQuery } from '../../../graphql/groups/queries/gen/GroupRoleByRoleId.gen';
import {
  GroupRolesByGroupIdQuery,
  useGroupRolesByGroupIdLazyQuery,
} from '../../../graphql/groups/queries/gen/GroupRolesByGroupId.gen';
import { useServerRoleByIdLazyQuery } from '../../../graphql/roles/queries/gen/ServerRoleById.gen';
import {
  ServerRoleOptionsQuery,
  useServerRoleOptionsLazyQuery,
} from '../../../graphql/roles/queries/gen/ServerRoleOptions.gen';
import { useVerifiedServerMembersLazyQuery } from '../../../graphql/users/queries/gen/VerifiedServerMembers.gen';
import { UnwrapArray } from '../../../types/shared.types';
import {
  PermissionName,
  initGroupRolePermissions,
  initServerRolePermissions,
} from '../../../utils/role.utils';
import Accordion, {
  AccordionDetails,
  AccordionSummary,
} from '../../Shared/Accordion';
import ColorPicker from '../../Shared/ColorPicker';
import Flex from '../../Shared/Flex';
import Modal from '../../Shared/Modal';
import PrimaryActionButton from '../../Shared/PrimaryActionButton';
import ProgressBar from '../../Shared/ProgressBar';
import { TextField } from '../../Shared/TextField';
import ProposePermissionToggle from './ProposePermissionToggle';
import ProposeRoleMemberOption from './ProposeRoleMemberOption';

type RoleOption =
  | UnwrapArray<ServerRoleOptionsQuery['serverRoles']>
  | UnwrapArray<GroupRolesByGroupIdQuery['group']['roles']>;

interface Props {
  actionType?: ProposalActionType;
  groupId?: number | null;
  setFieldValue: (
    field: ProposalActionFieldName,
    value: ProposalActionRoleInput,
  ) => void;
  onClose(): void;
  isServerScope?: boolean;
}

const ProposeRoleModal = ({
  groupId,
  actionType,
  setFieldValue,
  onClose,
  isServerScope,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPermissions, setShowPermissions] = useState(true);

  const [color, setColor] = useState(DEFAULT_ROLE_COLOR);
  const [selectedMembers, setSelectedMembers] = useState<
    ProposalActionRoleMemberInput[]
  >([]);

  // Group role queries
  const [
    getGroupRoles,
    {
      data: groupRolesData,
      loading: groupRolesLoading,
      error: groupRolesError,
    },
  ] = useGroupRolesByGroupIdLazyQuery();
  const [
    getSelectedGroupRole,
    {
      data: selectedGroupRoleData,
      loading: selectedGroupRoleLoading,
      error: selectedGroupRoleError,
    },
  ] = useGroupRoleByRoleIdLazyQuery();
  const [
    getGroupMembers,
    {
      data: groupMembersData,
      loading: groupMembersLoading,
      error: groupMembersError,
    },
  ] = useGroupMembersByGroupIdLazyQuery();

  // Server role queries
  const [
    getServerRoles,
    {
      data: serverRolesData,
      loading: serverRolesLoading,
      error: serverRolesError,
    },
  ] = useServerRoleOptionsLazyQuery();
  const [
    getSelectedServerRole,
    {
      data: selectedServerRoleData,
      loading: selectedServerRoleLoading,
      error: selectedServerRoleError,
    },
  ] = useServerRoleByIdLazyQuery();
  const [
    getVerifiedServerMembers,
    {
      data: verfiedServerMembersData,
      loading: verifiedServerMembersLoading,
      error: verifiedServerMembersError,
    },
  ] = useVerifiedServerMembersLazyQuery();

  const { t } = useTranslation();

  const initialValues: ProposalActionRoleInput = {
    name: '',
    permissions: {},
  };

  const isCreateRole = actionType === 'CreateRole';
  const isChangeRole = actionType === 'ChangeRole';

  const title = isCreateRole
    ? t('proposals.actions.createGroupRole')
    : t('proposals.actions.changeGroupRole');

  const roles = groupRolesData?.group.roles || serverRolesData?.serverRoles;
  const selectedRole =
    selectedGroupRoleData?.groupRole || selectedServerRoleData?.serverRole;

  const permissionNames: PermissionName[] = isServerScope
    ? SERVER_PERMISSION_NAMES
    : GROUP_PERMISSION_NAMES;

  const membersLoading =
    groupMembersLoading ||
    groupRolesLoading ||
    selectedGroupRoleLoading ||
    verifiedServerMembersLoading ||
    serverRolesLoading ||
    selectedServerRoleLoading;

  const membersError =
    groupMembersError ||
    groupRolesError ||
    selectedGroupRoleError ||
    verifiedServerMembersError ||
    serverRolesError ||
    selectedServerRoleError;

  useEffect(() => {
    if (!groupId && !isServerScope) {
      return;
    }
    const init = async () => {
      if (isCreateRole) {
        if (groupId) {
          await getGroupMembers({ variables: { groupId } });
        } else {
          await getVerifiedServerMembers();
        }
        setOpen(true);
      }
      if (isChangeRole) {
        if (groupId) {
          await getGroupRoles({ variables: { groupId } });
        } else {
          await getServerRoles();
        }
        setOpen(true);
      }
    };
    init();
  }, [
    groupId,
    isChangeRole,
    isCreateRole,
    isServerScope,
    getGroupMembers,
    getGroupRoles,
    getServerRoles,
    getVerifiedServerMembers,
  ]);

  const getMembers = () => {
    if (selectedRole) {
      return [...selectedRole.members, ...selectedRole.availableUsersToAdd];
    }
    if (verfiedServerMembersData) {
      return verfiedServerMembersData.verifiedUsers;
    }
    if (groupMembersData) {
      return groupMembersData.group.members;
    }
    return [];
  };

  const getPermissions = () => {
    if (selectedRole) {
      return selectedRole.permissions;
    }
    if (isServerScope) {
      return initServerRolePermissions();
    }
    return initGroupRolePermissions();
  };

  const isSubmitButtonDisabled = (
    values: ProposalActionRoleInput,
    isSubmitting: boolean,
  ) => {
    if (isSubmitting) {
      return true;
    }
    if (isChangeRole) {
      if (!selectedRole) {
        return true;
      }
      const includesPermissions =
        values.permissions &&
        Object.values(values.permissions).some(
          (value) => typeof value === 'boolean',
        );
      const dirty =
        includesPermissions ||
        selectedMembers.length ||
        color !== selectedRole.color ||
        values.name !== selectedRole.name;
      return !dirty;
    }
    return !values.name;
  };

  const handleSelectRoleChange =
    (
      handleChange: (e: ChangeEvent) => void,
      setFieldValue: (field: string, value: any) => void,
    ) =>
    (event: SelectChangeEvent<number>, _: ReactNode) => {
      // Change selection state immediately
      handleChange(event as ChangeEvent);

      // Make API call after state change
      if (isServerScope) {
        getSelectedServerRole({
          variables: { id: +event.target.value },
          onCompleted({ serverRole }) {
            setColor(serverRole.color);
            setFieldValue('name', serverRole.name);
          },
        });
        return;
      }
      getSelectedGroupRole({
        variables: { id: +event.target.value },
        onCompleted({ groupRole }) {
          setColor(groupRole.color);
          setFieldValue('name', groupRole.name);
        },
      });
    };

  const handleAccordionChange =
    (panel: 'permissions' | 'members') =>
    (_: SyntheticEvent, newExpanded: boolean) => {
      if (panel === 'permissions') {
        setShowPermissions(newExpanded);
        return;
      }
      setShowMembers(newExpanded);
    };

  const handleColorChange = (color: ColorResult) => setColor(color.hex);

  const handleClose = () => {
    setOpen(false);
    setColor(DEFAULT_ROLE_COLOR);
    setSelectedMembers([]);
    setShowMembers(false);
    onClose();
  };

  const handleSubmit = async (formValues: ProposalActionRoleInput) => {
    setFieldValue(ProposalActionFieldName.Role, {
      ...formValues,
      members: selectedMembers,
      color,
    });
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={handleClose} title={title} centeredTitle>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ isSubmitting, values, handleChange, setFieldValue }) => (
          <Form>
            <FormGroup>
              {isChangeRole && roles && (
                <FormControl variant="standard" sx={{ marginBottom: 1 }}>
                  <InputLabel>
                    {t('proposals.labels.selectRoleToChange')}
                  </InputLabel>
                  <Select
                    name={ProposeRoleModalFieldName.RoleToUpdateId}
                    onChange={handleSelectRoleChange(
                      handleChange,
                      setFieldValue,
                    )}
                    value={values.roleToUpdateId || ''}
                  >
                    {roles.map((role: RoleOption) => (
                      <MenuItem value={role.id} key={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {(isCreateRole || values.roleToUpdateId) && (
                <>
                  <TextField
                    autoComplete="off"
                    label={t('groups.form.name')}
                    name={FieldNames.Name}
                  />

                  <ColorPicker
                    color={color}
                    label={t('roles.form.colorPickerLabel')}
                    onChange={handleColorChange}
                    sx={{ marginBottom: 2 }}
                  />

                  <Accordion
                    expanded={showPermissions}
                    onChange={handleAccordionChange('permissions')}
                  >
                    <AccordionSummary>
                      <Typography>
                        {t('permissions.labels.permissions')}
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                      {permissionNames.map((permissionName) => (
                        <ProposePermissionToggle
                          key={permissionName}
                          permissionName={permissionName}
                          setFieldValue={setFieldValue}
                          permissions={getPermissions()}
                          formValues={values}
                        />
                      ))}
                    </AccordionDetails>
                  </Accordion>

                  <Accordion
                    expanded={showMembers}
                    onChange={handleAccordionChange('members')}
                  >
                    <AccordionSummary>
                      <Typography>{t('roles.labels.members')}</Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                      {membersLoading && <ProgressBar />}

                      {membersError && (
                        <Typography marginTop={1}>
                          {t('errors.somethingWentWrong')}
                        </Typography>
                      )}

                      {getMembers().map((member) => (
                        <ProposeRoleMemberOption
                          key={member.id}
                          member={member}
                          selectedMembers={selectedMembers}
                          setSelectedMembers={setSelectedMembers}
                          currentRoleMembers={selectedRole?.members}
                        />
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </>
              )}
            </FormGroup>

            {(isCreateRole || values.roleToUpdateId) && (
              <Flex justifyContent="end">
                <PrimaryActionButton
                  disabled={isSubmitButtonDisabled(values, isSubmitting)}
                  isLoading={isSubmitting}
                  sx={{ marginTop: 1.5 }}
                  type="submit"
                >
                  {t('actions.confirm')}
                </PrimaryActionButton>
              </Flex>
            )}
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ProposeRoleModal;
