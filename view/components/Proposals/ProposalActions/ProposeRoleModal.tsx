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
  GroupRolePermissionInput,
  ProposalActionRoleInput,
  ProposalActionRoleMemberInput,
} from '../../../apollo/gen';
import { useGroupMembersByGroupIdLazyQuery } from '../../../apollo/groups/generated/GroupMembersByGroupId.query';
import { useGroupRoleByRoleIdLazyQuery } from '../../../apollo/groups/generated/GroupRoleByRoleId.query';
import { useGroupRolesByGroupIdLazyQuery } from '../../../apollo/groups/generated/GroupRolesByGroupId.query';
import { FieldNames } from '../../../constants/shared.constants';
import {
  ProposalActionFieldName,
  ProposalActionType,
  ProposeRoleModalFieldName,
} from '../../../constants/proposal.constants';
import {
  DEFAULT_ROLE_COLOR,
  GROUP_PERMISSION_NAMES,
} from '../../../constants/role.constants';
import { initGroupRolePermissions } from '../../../utils/role.utils';
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

export interface ProposeRoleModalValues {
  name: string;
  permissions: GroupRolePermissionInput;
  roleId: number | '';
}

interface Props {
  actionType?: string;
  groupId?: number | null;
  setFieldValue: (
    field: ProposalActionFieldName,
    value: ProposalActionRoleInput,
  ) => void;
  onClose(): void;
}

const ProposeRoleModal = ({
  groupId,
  actionType,
  setFieldValue,
  onClose,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPermissions, setShowPermissions] = useState(true);

  const [color, setColor] = useState(DEFAULT_ROLE_COLOR);
  const [selectedMembers, setSelectedMembers] = useState<
    ProposalActionRoleMemberInput[]
  >([]);

  const [
    getGroupMembers,
    {
      data: groupMembersData,
      loading: groupMembersLoading,
      error: groupMembersError,
    },
  ] = useGroupMembersByGroupIdLazyQuery();

  const [
    getGroupRoles,
    {
      data: groupRolesData,
      loading: groupRolesLoading,
      error: groupRolesError,
    },
  ] = useGroupRolesByGroupIdLazyQuery();

  const [
    getSelectedRole,
    {
      data: selectedRoleData,
      loading: selectedRoleLoading,
      error: selectedRoleError,
    },
  ] = useGroupRoleByRoleIdLazyQuery();

  const { t } = useTranslation();

  const isCreateRole = actionType === ProposalActionType.CreateRole;
  const isChangeRole = actionType === ProposalActionType.ChangeRole;

  useEffect(() => {
    if (!groupId) {
      return;
    }
    if (isCreateRole) {
      getGroupMembers({ variables: { groupId } });
      setOpen(true);
    }
    if (isChangeRole) {
      getGroupRoles({ variables: { groupId } });
      setOpen(true);
    }
  }, [groupId, isChangeRole, isCreateRole, getGroupMembers, getGroupRoles]);

  const roles = groupRolesData?.group.roles;
  const selectedRole = selectedRoleData?.groupRole;
  const permissions = selectedRole?.permissions || initGroupRolePermissions();

  const members = selectedRole
    ? [...selectedRole.members, ...selectedRole.availableUsersToAdd]
    : groupMembersData?.group.members || [];

  const membersLoading =
    groupMembersLoading || groupRolesLoading || selectedRoleLoading;
  const membersError =
    groupMembersError || groupRolesError || selectedRoleError;

  const initialValues: ProposalActionRoleInput = {
    name: '',
    permissions: {},
  };

  const title = isCreateRole
    ? t('proposals.actions.createGroupRole')
    : t('proposals.actions.changeGroupRole');

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
      getSelectedRole({
        variables: { id: +event.target.value },
        onCompleted({ groupRole }) {
          setColor(groupRole.color);
          setFieldValue('name', groupRole.name);
        },
      });
      handleChange(event as ChangeEvent);
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
                    {roles.map((role) => (
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
                      {GROUP_PERMISSION_NAMES.map((permissionName) => (
                        <ProposePermissionToggle
                          key={permissionName}
                          permissionName={permissionName}
                          setFieldValue={setFieldValue}
                          permissions={permissions}
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

                      {members.length &&
                        members.map((member) => (
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
