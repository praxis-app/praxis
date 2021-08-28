import { useEffect, useState } from "react";
import Head from "next/head";
import { Container } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";

import DesktopHeader from "../Shared/DesktopHeader";
import HeadContent from "./HeadContent";
import Messages from "../../utils/messages";
import Breadcrumbs from "../Shared/Breadcrumbs";
import Toast from "../Shared/Toast";
import muiTheme from "../../styles/Shared/theme";
import BottomNav from "../Shared/BottomNav";
import { useIsMobile, useRestoreUserSession } from "../../hooks";
import TopNav from "../Shared/TopNav";
import NavDrawer from "../Shared/NavDrawer";

interface Props {
  children: React.ReactChild;
}

const Layout = ({ children }: Props) => {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
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

      {isMobile ? <TopNav /> : <DesktopHeader />}

      <Container maxWidth="sm">
        <Breadcrumbs />
        {children}
        <Toast />
      </Container>

      {isMobile && (
        <>
          <NavDrawer />
          <BottomNav />
        </>
      )}
    </ThemeProvider>
  );
};

export default Layout;
