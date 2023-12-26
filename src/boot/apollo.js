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
import { DefaultApolloClient, ApolloClients } from '@vue/apollo-composable'
import { setContext } from "@apollo/client/link/context"


export default boot(
  async ({ app }) => {
    // Default client.
    //const options = /* await */ getClientOptions(/* {app, router ...} */)

    // authentication middleware (for query / mutation) (local token) obsoleted now
    /*const authMiddleware = new ApolloLink((operation, forward) => {
      // add the authorization to the headers
      const token = sessionStorage.getItem('access-token');
      operation.setContext({
        headers: {
          authorization: token ? `Bearer ${token}` : "",
        },
      })
      return forward(operation);
    });
    */

    // authentication middleware (for query / mutation) async firebase token
    const asyncAuthMiddleware = setContext(operation =>
      // add the authorization to the headers
      FirebaseAuth.currentUser? FirebaseAuth.currentUser.getIdToken().then((token) => {
        return {
          headers: {
            authorization: token ? `Bearer ${token}` : "",
          }
        }
      }): ''
    );

    // new graphql-ws link (for subscription)
    const wsLink = new GraphQLWsLink(
      createClient({
        // azure endpoint
        //url: "wss://cciycgw.eastasia.cloudapp.azure.com/v1/graphql",

        // production endpoint
        // url: "wss://hasura.cciyc.com:4430/v1/graphql",

        // offline development endpoint
        // url: process.env.NODE_ENV == "development" ? "wss://hasuradev.cciyc.com/v1/graphql" : "wss://hasura.cciyc.com:4430/v1/graphql",

        // development endpoint
        url: process.env.NODE_ENV == "development" ? "wss://hasuradev.aka-technology.com/v1/graphql" : "wss://hasura.cciyc.com:4430/v1/graphql",
        connectionParams: async () => {
          //const token = sessionStorage.getItem("access-token")
          const token = FirebaseAuth.currentUser? await FirebaseAuth.currentUser.getIdToken(): '';
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
      // azure endpoint
      //uri: 'https://cciycgw.eastasia.cloudapp.azure.com/v1/graphql/',

      // production endpoint
      // uri: 'https://hasura.cciyc.com:4430/v1/graphql/'

      // offline development endpoint
      // uri: process.env.NODE_ENV == "development" ? "https://hasuradev.cciyc.com/v1/graphql/" : "https://hasura.cciyc.com:4430/v1/graphql/",

      // development endpoint
      uri: process.env.NODE_ENV == "development" ? "https://hasuradev.aka-technology.com/v1/graphql/" : "https://hasura.cciyc.com:4430/v1/graphql/",
    })

    // error link
    /*const errorLink = onError(({ graphQLErrors, networkError, operation, response }) => {
      if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      if (networkError) console.log(`[Network error]: ${networkError} ${operation} ${response}`);
    });
    */

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
      cache: new InMemoryCache(
        {
          typePolicies: {
            Member: {
              keyFields: ["c_mem_id"],
            },
            Log: {
              keyFields: ["log_id"],
            },
            Relation: {
              keyFields: ["c_mem_id_1", "c_mem_id_2"],
            },
            tbl_account: {
              keyFields: ["c_receipt_no"],
            },
            HTX_Event: {
              keyFields: ["c_act_code"],
            },
            Event_Evaluation: {
              keyFields: ["uuid"],
            },
            Event_Evaluation_Account: {
              keyFields: ["account_uuid"],
            },
            Event_Favourate: {
              keyFields: ["username", "c_act_code"],
            },
            tbl_act_fee: {
              keyFields: ["c_act_code", "c_type"],
            },
            tbl_act_reg: {
              keyFields: ["ID"],
            },
            EventRegistration_to_Member: {
              keyFields: ["c_mem_id"]
            },
            tbl_act_session: {
              keyFields: ["c_act_code", "d_act", "inCenter"],
            },
            MemberAccount: {
              keyFields: ["c_receipt_no"],
            },
            RelationMember1: {
              keyFields: ["c_mem_id"],
            },
            RelationMember2: {
              keyFields: ["c_mem_id"]
            },
            Event_Evaluation_Account: {
              keyFields: ["account_uuid"]
            },
            Event_Prepaid: {
              keyFields: ["uuid"]
            },
            tbl_sel_acc_type: {
              keyFields: ["c_type"]
            },
            HTX_News: {
              keyFields: ["NewsID"]
            },
            HTX_Article: {
              keyFields: ['ArticleID']
            },
            HTX_About_Article: {
              keyFields: ['ArticleID']
            }
          }
        }
      ),
      //link: from([errorLink, concat(authMiddleware, link)]),
      link: from([errorLink, link]),
      //link: link,
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
        },
        $mutate: {
          loadingKey: 'loading',
          fetchPolicy: 'network-only',
        }
      },
    })

    // hook to the app
    app.provide(ApolloClients, apolloClients)
    app.provide(DefaultApolloClient, apolloClient)
    app.use(apolloProvider)
  }
)
