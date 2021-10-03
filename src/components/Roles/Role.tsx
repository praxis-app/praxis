import Link from "next/link";
import { Avatar, LinearProgress } from "@material-ui/core";
import { ArrowForwardIos, Person } from "@material-ui/icons";

import Messages from "../../utils/messages";
import styles from "../../styles/Role/Role.module.scss";
import { BLACK } from "../../styles/Shared/theme";
import { NavigationPaths, ResourcePaths } from "../../constants/common";
import { useMembersByRoleId } from "../../hooks";

interface Props {
  role: ClientRole;
  group?: ClientGroup;
}

const Role = ({ role, group }: Props) => {
  const { id, name, color } = role;
  const [members, _, membersLoading] = useMembersByRoleId(id);
  const editRolePath = `${ResourcePaths.Roles}${id}${NavigationPaths.Edit}`;
  const editGroupRolePath = `${ResourcePaths.Group}${group?.name}${editRolePath}`;

  if (membersLoading) return <LinearProgress />;

  return (
    <Link href={group ? editGroupRolePath : editRolePath} passHref>
      <a className={styles.role}>
        <div className={styles.link}>
          <Avatar
            style={{
              backgroundColor: color,
              color: BLACK,
            }}
          />
          <div className={styles.info}>
            <div className={styles.name}>{name}</div>
            <div className={styles.members}>
              <Person className={styles.icon} style={{ fontSize: 18 }} />
              {Messages.roles.members.nMembers(members.length)}
            </div>
          </div>
        </div>
        <ArrowForwardIos className={styles.icon} style={{ marginTop: 12 }} />
      </a>
    </Link>
  );
};

export default Role;
