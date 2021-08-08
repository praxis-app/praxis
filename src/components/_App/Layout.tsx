import Head from "next/head";
import { Container } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";

import Header from "./Header";
import HeadContent from "./HeadContent";
import Messages from "../../utils/messages";
import Breadcrumbs from "../Shared/Breadcrumbs";
import Toast from "../Shared/Toast";
import muiTheme from "../../styles/Shared/theme";
import { useEffect, useState } from "react";

interface Props {
  children: React.ReactChild;
}

const Layout = ({ children }: Props) => {
  /* TODO: Move this long comment to documentation
  Makes sure component is completely mounted and all matching html tags are present
   before adding additional components inside. Otherwise closing tags can be missed
   and classes incorrectly assigned to wrong HTML elements */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted)
    return (
      <ThemeProvider theme={muiTheme}>
        <Head>
          <HeadContent />
          <title>{Messages.brand()}</title>
        </Head>
        <Header />
        <Container maxWidth="sm">
          <Breadcrumbs />
          {children}
          <Toast />
        </Container>
      </ThemeProvider>
    );
  return <></>;
};

export default Layout;
