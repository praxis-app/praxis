import { useEffect, useState } from "react";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import { Person, Home, Group, Menu } from "@material-ui/icons";

import { NavigationPaths, ResourcePaths } from "../../constants/common";
import { navOpenVar } from "../../apollo/client/localState";
import { useCurrentUser } from "../../hooks";
import Messages from "../../utils/messages";
import { useReactiveVar } from "@apollo/client";

interface NavLinkProps {
  href: string;
  text?: string;
  icon?: React.ReactChild;
}

const NavLink = ({ href, icon, text }: NavLinkProps) => {
  return (
    <Link href={href}>
      <a style={{ color: "inherit" }}>{icon ? icon : text}</a>
    </Link>
  );
};

const BottomNav = () => {
  const currentUser = useCurrentUser();
  const [value, setValue] = useState<number>(0);
  const navDrawerOpen = useReactiveVar(navOpenVar);
  const userProfilePath = `${ResourcePaths.User}${currentUser?.name}`;
  const { asPath: currentPath } = useRouter();

  useEffect(() => {
    if (!navDrawerOpen)
      switch (currentPath) {
        case NavigationPaths.Home:
          setValue(0);
          break;
        case getMatching(ResourcePaths.Group):
        case NavigationPaths.Groups:
          setValue(1);
          break;
        case userProfilePath:
          setValue(2);
          break;
        default:
          setValue(3);
      }
  }, [currentPath, navDrawerOpen]);

  const getMatching = (path: string): string => {
    const match = currentPath.match(path);
    if (match) return currentPath;
    return "";
  };

  return (
    <BottomNavigation
      value={value}
      onChange={(_event, newValue) => {
        setValue(newValue);
      }}
      showLabels
    >
      <BottomNavigationAction
        onClick={() => Router.push(NavigationPaths.Home)}
        icon={<NavLink href={NavigationPaths.Home} icon={<Home />} />}
        label={Messages.navigation.home()}
      />

      <BottomNavigationAction
        onClick={() => Router.push(NavigationPaths.Groups)}
        icon={<NavLink href={NavigationPaths.Groups} icon={<Group />} />}
        label={Messages.navigation.groups()}
      />

      <BottomNavigationAction
        disabled={!currentUser}
        onClick={() => Router.push(userProfilePath)}
        icon={<NavLink href={userProfilePath} icon={<Person />} />}
        label={Messages.navigation.profile()}
      />

      <BottomNavigationAction
        onClick={() => navOpenVar(true)}
        label={Messages.navigation.menu()}
        icon={<Menu />}
      />
    </BottomNavigation>
  );
};

export default BottomNav;
