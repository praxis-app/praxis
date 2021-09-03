import { useEffect, useState } from "react";
import Head from "next/head";
import { Container as MUIContainer, useMediaQuery } from "@material-ui/core";
import {
  createStyles,
  Theme,
  ThemeProvider,
  useTheme,
  withStyles,
} from "@material-ui/core/styles";

import HeadContent from "./HeadContent";
import Messages from "../../utils/messages";
import Breadcrumbs from "../Shared/Breadcrumbs";
import Toast from "../Shared/Toast";
import muiTheme from "../../styles/Shared/theme";
import BottomNav from "../Navigation/BottomNav";
import { useIsDesktop, useIsMobile, useRestoreUserSession } from "../../hooks";
import TopNav from "../Navigation/TopNav";
import TopNavDesktop from "../Navigation/TopNavDesktop";
import NavDrawer from "../Navigation/NavDrawer";
import LeftNav from "../Navigation/LeftNav";
import ScrollToTop from "../Navigation/ScrollToTop";

const Container = withStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: 100,
      marginBottom: 200,
      [theme.breakpoints.up("md")]: {
        marginTop: 135,
      },
    },
  })
)(MUIContainer);

interface Props {
  children: React.ReactChild;
}

const Layout = ({ children }: Props) => {
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));

  useRestoreUserSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ThemeProvider theme={muiTheme}>
      <Head>
        <HeadContent />
        <title>{Messages.brand()}</title>
      </Head>

      {isMobile && (
        <>
          <TopNav />
          <NavDrawer />
          <BottomNav />
        </>
      )}

      {isDesktop && (
        <>
          <TopNavDesktop />
          {isLarge && <LeftNav />}
          <ScrollToTop />
        </>
      )}

      <Container maxWidth="sm">
        <Breadcrumbs />
        {children}
        <Toast />
      </Container>
    </ThemeProvider>
  );
};

export default Layout;
