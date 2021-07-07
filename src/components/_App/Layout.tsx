import Head from "next/head";
import { Container } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";

import Header from "./Header";
import HeadContent from "./HeadContent";
import Messages from "../../utils/messages";
import Breadcrumbs from "../Shared/Breadcrumbs";
import Toast from "../Shared/Toast";
import muiTheme from "../../styles/Shared/theme";

interface Props {
  children: React.ReactChild;
}

const Layout = ({ children }: Props) => {
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
};

export default Layout;
