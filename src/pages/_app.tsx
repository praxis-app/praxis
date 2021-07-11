import { ApolloProvider } from "@apollo/client";
import { AppProps } from "next/app";

import Layout from "../components/_App/Layout";
import { useApollo } from "../apollo/client";
import "../styles/Shared/globals.scss";

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
