import { CardActionArea, Checkbox, SxProps, Typography } from '@mui/material';
import { UpdateDefaultGroupsInput } from '../../../src/server-configs/models/update-default-groups.input';
import { AddDefaultGroupsOptionFragment } from '../../graphql/settings/fragments/gen/AddDefaultGroupsOption.gen';
import GroupAvatar from '../Groups/GroupAvatar';
import Flex from '../Shared/Flex';

interface Props {
  group: AddDefaultGroupsOptionFragment;
  formValues: UpdateDefaultGroupsInput;
  onClick(): void;
}

const AddDefaultGroupsOption = ({ group, formValues, onClick }: Props) => {
  const groupStyles: SxProps = {
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: 2,
    paddingLeft: 0.75,
    paddingRight: 0.25,
    paddingY: 0.75,
  };

  const isSelected = () => {
    const selectedGroup = formValues.groups.find((g) => g.groupId === group.id);
    if (selectedGroup) {
      return selectedGroup.defaultGroup;
    }
    return group.defaultGroup;
  };

  return (
    <CardActionArea key={group.id} onClick={onClick} sx={groupStyles}>
      <Flex>
        <GroupAvatar group={group} sx={{ marginRight: 1.5 }} />
        <Typography color="primary" sx={{ marginTop: 1, userSelect: 'none' }}>
          {group.name}
        </Typography>
      </Flex>

      <Checkbox checked={isSelected()} disableRipple />
    </CardActionArea>
  );
};

export default AddDefaultGroupsOption;
