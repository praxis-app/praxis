import Head from "next/head";
import { Container } from "react-bootstrap";

import Header from "./Header";
import HeadContent from "./HeadContent";

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <HeadContent />
        <title>Praxis</title>
      </Head>
      <Header />
      <Container>{children}</Container>
    </>
  );
};

export default Layout;
