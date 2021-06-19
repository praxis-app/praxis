import { useReactiveVar } from "@apollo/client";
import { Breadcrumbs, makeStyles, Typography } from "@material-ui/core";
import Link from "next/link";

import { breadcrumbsVar } from "../../apollo/client/localState";

const gray = "rgb(190, 190, 190)";

const useStyles = makeStyles({
  root: {
    marginBottom: 18,
  },
  separator: {
    color: gray,
  },
});

const CommonBreadcrumbs = () => {
  const breadcrumbs = useReactiveVar(breadcrumbsVar);
  const classes = useStyles();

  return (
    <Breadcrumbs classes={{ root: classes.root, separator: classes.separator }}>
      {breadcrumbs.map(({ label, href }) => {
        if (href)
          return (
            <Link href={href}>
              <a>
                <Typography style={{ color: gray }} key={label}>
                  {label}
                </Typography>
              </a>
            </Link>
          );
        return (
          <Typography style={{ color: "white" }} key={label}>
            {label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
};

export default CommonBreadcrumbs;
