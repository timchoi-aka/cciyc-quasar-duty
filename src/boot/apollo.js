import { boot } from 'quasar/wrappers'
import { ApolloClient, createHttpLink, InMemoryCache, ApolloLink, concat, from, split } from '@apollo/client/core'
import { getMainDefinition } from '@apollo/client/utilities'
import { logErrorMessages } from "@vue/apollo-util"
import { onError } from "@apollo/client/link/error"
import { getClientOptions } from 'src/apollo'
import { createApolloProvider } from '@vue/apollo-option'
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { FirebaseAuth } from "boot/firebase"
import { ApolloClients } from '@vue/apollo-composable'
import { setContext } from "@apollo/client/link/context"

export default boot(
  async ({ app }) => {
    // Default client.
    const options = /* await */ getClientOptions(/* {app, router ...} */)    
  
    // authentication middleware (for query / mutation) (local token) obsoleted now
    const authMiddleware = new ApolloLink((operation, forward) => {
      // add the authorization to the headers
      const token = sessionStorage.getItem('access-token');
      operation.setContext({
        headers: {
          authorization: token ? `Bearer ${token}` : "",
        },
      })
      return forward(operation);
    });

    // authentication middleware (for query / mutation) async firebase token
    const asyncAuthMiddleware = setContext(operation => 
      // add the authorization to the headers
      FirebaseAuth.currentUser.getIdToken().then((token) => {
        return {
          headers: {
            authorization: token ? `Bearer ${token}` : "",
          }
        }
      })
    );

    // new graphql-ws link (for subscription)
    const wsLink = new GraphQLWsLink(
      createClient({
        url: "wss://cciycgw.eastasia.cloudapp.azure.com/v1/graphql",
        connectionParams: async () => {
          const token = await FirebaseAuth.currentUser.getIdToken();
          return {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
        },
      }),
    );

    // http link 
    const apiLink = createHttpLink({ 
      uri: 'https://cciycgw.eastasia.cloudapp.azure.com/v1/graphql/',
    })

    // error link
    const errorLink = onError((error) => {
      if (process.env.NODE_ENV !== "production") {
        logErrorMessages(error)
      }
    })

    // using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent
    const link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === 'OperationDefinition' &&
          operation === 'subscription'
      },
      wsLink, // subscription to graphqlwslink
      concat(asyncAuthMiddleware, apiLink) // other queries concat with middleware
    )

    // declare apollo client, using inMemoryCache,
    // first link = errorLink, termination link = link
    const apolloClient = new ApolloClient({
      cache: new InMemoryCache(),
      //link: from([errorLink, concat(authMiddleware, link)]),
      link: from([errorLink, link]),
      defaultOptions: {
        fetchPolicy: 'network-only',
      },
    })
    
    // make it default client
    const apolloClients = {
      default: apolloClient,
    }
    
    // other options
    const apolloProvider = createApolloProvider({
      defaultClient: apolloClient,
      defaultOptions: {
        $query: {
          loadingKey: 'loading',
          fetchPolicy: 'network-only',
          watchQuery: {
            nextFetchPolicy: 'network-only', 
          },
        },
        $mutate: {
          loadingKey: 'loading',
          fetchPolicy: 'network-only',
          watchQuery: {
            nextFetchPolicy: 'network-only', 
          },
        }
      },
    })

    // hook to the app
    app.provide(ApolloClients, apolloClients)
    app.use(apolloProvider)
  }
)