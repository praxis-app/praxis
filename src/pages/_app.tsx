import { ApolloProvider } from "@apollo/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.scss";

import Layout from "../components/_App/Layout";
import { useApollo } from "../apollo/client";

const App = ({ Component, pageProps }) => {
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
