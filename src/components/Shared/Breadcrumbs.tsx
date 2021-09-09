import { useReactiveVar } from "@apollo/client";
import { Breadcrumbs, Typography } from "@material-ui/core";
import Link from "next/link";

import { breadcrumbsVar } from "../../apollo/client/localState";

const CommonBreadcrumbs = () => {
  const breadcrumbs = useReactiveVar(breadcrumbsVar);

  if (breadcrumbs.length)
    return (
      <Breadcrumbs>
        {breadcrumbs.map(({ label, href }) => {
          if (href)
            return (
              <Link href={href} key={href}>
                <a>
                  <Typography>{label}</Typography>
                </a>
              </Link>
            );
          return (
            <Typography color="primary" key={label}>
              {label}
            </Typography>
          );
        })}
      </Breadcrumbs>
    );

  return null;
};

export default CommonBreadcrumbs;
