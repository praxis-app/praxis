import Head from "next/head";
import { Container } from "react-bootstrap";

import Header from "./Header";
import HeadContent from "./HeadContent";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <>
      <Head>
        <HeadContent />
        <title>praxis</title>
      </Head>
      <Header />
      <Container>{children}</Container>
    </>
  );
};

export default Layout;
