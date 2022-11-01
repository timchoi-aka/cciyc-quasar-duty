import { boot } from 'quasar/wrappers'
import { ApolloClient, createHttpLink, InMemoryCache, ApolloLink, concat, split } from '@apollo/client/core'
import { getMainDefinition } from "@apollo/client/utilities"
import { logErrorMessages } from "@vue/apollo-util"
import { onError } from "@apollo/client/link/error"
import { getClientOptions } from 'src/apollo'
import { createApolloProvider } from '@vue/apollo-option'
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { FirebaseAuth } from "boot/firebase"
import { ApolloClients } from '@vue/apollo-composable'

export default boot(
  async ({ app }) => {
    // Default client.
    const options = /* await */ getClientOptions(/* {app, router ...} */)    
  
    const authMiddleware = new ApolloLink((operation, forward) => {
      // add the authorization to the headers
      const token = sessionStorage.getItem('access-token');
      operation.setContext({
        headers: {
          authorization: token ? `Bearer ${token}` : "",
        },
      });
      return forward(operation);
    });

    // options
    const apiLink = createHttpLink({ 
      uri: 'https://cciycgw.eastasia.cloudapp.azure.com/v1/graphql/' ,
    })

    // new graphql-ws link
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
    
    const errorLink = onError((error) => {
      if (process.env.NODE_ENV !== "production") {
          logErrorMessages(error)
      }
    })

    const apolloClient = new ApolloClient({
      cache: new InMemoryCache({
        typePolicies: {
          Member: {
            keyFields: ["c_mem_id"],
          },
        },
      }),
      link: split(
        ({ query }) => {
            const definition = getMainDefinition(query)
            // console.log(definition)
            return (
                definition.kind === "OperationDefinition" &&
                definition.operation === "subscription"
            )
        },
        wsLink,
        concat(authMiddleware, apiLink)
      ),
    })
    
    const apolloClients = {
      default: apolloClient,
    }
    
    app.provide(ApolloClients, apolloClients)

    const apolloProvider = createApolloProvider({
      defaultClient: apolloClient,
      defaultOptions: {
        $query: {
          loadingKey: 'loading',
          fetchPolicy: 'cache-and-network',
        },
      },
    })
    app.use(apolloProvider)
  }
)

/*
import { ApolloClient, createHttpLink, InMemoryCache, HttpLink} from '@apollo/client/core'
import { DefaultApolloClient } from '@vue/apollo-composable'
//import { WebSocketLink } from "@apollo/client/link/ws"
import { boot } from 'quasar/wrappers'
import { getClientOptions } from 'src/apollo'
import { createApolloProvider } from '@vue/apollo-option'

export default boot(
  /* async */ // ({ app }) => {
    // Cache implementation
    // const cache = new InMemoryCache()

    // http link
    /*
    const httpLink = new HttpLink({
      // You should use an absolute URL here
      uri: 'https://cciycgw.eastasia.cloudapp.azure.com/v1/graphql/',
    })
    */

    // websocket
    /*
    const wsLink = new WebSocketLink({
      uri: 'ws://cciycgw.eastasia.cloudapp.azure.com/v1/subscriptions/',
      options: {
        reconnect: true,
      },
    })
    */
    // using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent
    /*
    const link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === 'OperationDefinition' &&
          operation === 'subscription'
      },
      wsLink,
      httpLink
    )
    */

    // Default client.
    
    // const options = /* await */ getClientOptions(/* {app, router ...} */)
    // options.link = createHttpLink({ uri: 'https://cciycgw.eastasia.cloudapp.azure.com/v1/graphql/' })
    //options.link = link;
    // options.cache = cache;
    // const apolloClient = new ApolloClient(options)
   /*
    const apolloProvider = createApolloProvider({
      defaultClient: apolloClient,
    })

    app.provide(DefaultApolloClient, apolloProvider)
  }
)
*/