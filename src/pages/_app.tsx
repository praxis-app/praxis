import { ApolloProvider } from "@apollo/client";
import { AppProps } from "next/app";

import "../styles/Common/globals.scss";

import Layout from "../components/_App/Layout";
import { useApollo } from "../apollo/client";

const App = ({ Component, pageProps }: AppProps) => {
  const apolloClient = useApollo(pageProps.initialApolloState);

  return (
    <ApolloProvider client={apolloClient}>
      <Layout {...pageProps}>
        <Component {...pageProps} />
      </Layout>
    </ApolloProvider>
  );
};

export default App;
