import { ApolloProvider } from '@apollo/client'
import { AppProps } from 'next/app'

import { useApollo } from '../lib/client'
import Layout from '../components/Layout'

import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps.initialApolloState)

  return (
    <ApolloProvider client={apolloClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ApolloProvider>
  )
}

export default MyApp
