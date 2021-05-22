import Head from "next/head";
import { Container } from "react-bootstrap";

import Header from "./Header";
import HeadContent from "./HeadContent";
import Messages from "../../utils/messages";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <>
      <Head>
        <HeadContent />
        <title>{Messages.brand()}</title>
      </Head>
      <Header />
      <Container>{children}</Container>
    </>
  );
};

export default Layout;
