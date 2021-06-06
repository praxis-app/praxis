import Head from "next/head";
import { Container } from "@material-ui/core";

import Header from "./Header";
import HeadContent from "./HeadContent";
import Messages from "../../utils/messages";
import Breadcrumbs from "../Shared/Breadcrumbs";

interface Props {
  children: React.ReactChild;
}

const Layout = ({ children }: Props) => {
  return (
    <>
      <Head>
        <HeadContent />
        <title>{Messages.brand()}</title>
      </Head>
      <Header />
      <Container maxWidth="md">
        <Breadcrumbs />
        {children}
      </Container>
    </>
  );
};

export default Layout;
