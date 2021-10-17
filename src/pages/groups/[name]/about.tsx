import { useEffect } from "react";
import { useRouter } from "next/router";
import { CircularProgress, Typography } from "@material-ui/core";
import { truncate } from "lodash";

import { breadcrumbsVar } from "../../../apollo/client/localState";
import Messages from "../../../utils/messages";
import {
  ResourcePaths,
  TruncationSizes,
  TypeNames,
} from "../../../constants/common";
import { useGroupByName } from "../../../hooks";
import GroupsAbout from "../../../components/Groups/About";

const GroupsAboutPage = () => {
  const { query } = useRouter();
  const [group, _setGroup, groupLoading] = useGroupByName(query.name);

  useEffect(() => {
    if (group)
      breadcrumbsVar([
        {
          label: truncate(group.name, {
            length: TruncationSizes.ExtraSmall,
          }),
          href: `${ResourcePaths.Group}${group.name}`,
        },
        {
          label: Messages.groups.breadcrumbs.about(),
        },
      ]);
    else breadcrumbsVar([]);

    return () => {
      breadcrumbsVar([]);
    };
  }, [group]);

  if (groupLoading) return <CircularProgress />;
  if (!group)
    return <Typography>{Messages.items.notFound(TypeNames.Group)}</Typography>;

  return <GroupsAbout group={group} />;
};

export default GroupsAboutPage;
