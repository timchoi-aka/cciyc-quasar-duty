import { createHttpLink, InMemoryCache, concat, from, split } from '@apollo/client/core'
import { FirebaseAuth } from "boot/firebase"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { onError } from "@apollo/client/link/error"
import { logErrorMessages } from "@vue/apollo-util"
import { createClient } from "graphql-ws";


export /* async */ function getClientOptions(/* {app, router, ...} */ options) {
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

  const errorLink = onError((error) => {
    if (process.env.NODE_ENV !== "production") {
      logErrorMessages(error)
    }
  })

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

  return Object.assign(
    // General options.
    {
      /*
      link: createHttpLink({
        uri:
          process.env.GRAPHQL_URI ||
          // Change to your graphql endpoint.
          //'https://cciycgw.eastasia.cloudapp.azure.com/v1/graphql/',
          'https://hasura.cciyc.com:4430/v1/graphql/',
      }),
      */
      link: from([errorLink, link]),
      //cache: new InMemoryCache(),
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
            HTX_Gallery: {
              keyFields: ["GalleryID"],
            },
            HTX_Gallery_Photo: {
              keyFields: ["PhotoID"],
            },
          }
        }
      ),
      defaultOptions: {
        fetchPolicy: 'network-only',
      },
    },
    // Specific Quasar mode options.
    process.env.MODE === 'spa'
      ? {
          //
        }
      : {},
    process.env.MODE === 'ssr'
      ? {
          //
        }
      : {},
    process.env.MODE === 'pwa'
      ? {
          //
        }
      : {},
    process.env.MODE === 'bex'
      ? {
          //
        }
      : {},
    process.env.MODE === 'cordova'
      ? {
          //
        }
      : {},
    process.env.MODE === 'capacitor'
      ? {
          //
        }
      : {},
    process.env.MODE === 'electron'
      ? {
          //
        }
      : {},
    // dev/prod options.
    process.env.DEV
      ? {
          //
        }
      : {},
    process.env.PROD
      ? {
          //
        }
      : {},
    // For ssr mode, when on server.
    process.env.MODE === 'ssr' && process.env.SERVER
      ? {
          ssrMode: true,
        }
      : {},
    // For ssr mode, when on client.
    process.env.MODE === 'ssr' && process.env.CLIENT
      ? {
          ssrForceFetchDelay: 100,
        }
      : {}
  )
}
