import {
  createHttpLink,
  InMemoryCache,
  concat,
  from,
  split,
} from "@apollo/client/core";
import { FirebaseAuth } from "boot/firebase";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { onError } from "@apollo/client/link/error";
import { logErrorMessages } from "@vue/apollo-util";
import { createClient } from "graphql-ws";
import { setContext } from "@apollo/client/link/context";
import { getMainDefinition } from "@apollo/client/utilities";

export /* async */ function getClientOptions(/* {app, router, ...} */ options) {
  // authentication middleware (for query / mutation) async firebase token
  const asyncAuthMiddleware = setContext((operation) =>
    // add the authorization to the headers
    FirebaseAuth.currentUser
      ? FirebaseAuth.currentUser.getIdToken().then((token) => {
          return {
            headers: {
              authorization: token ? `Bearer ${token}` : "",
            },
          };
        })
      : ""
  );

  // new graphql-ws link (for subscription)
  const wsLink = new GraphQLWsLink(
    createClient({
      url: process.env.HASURA_SUBSCRIPTION,
      connectionParams: async () => {
        //const token = sessionStorage.getItem("access-token")
        const token = FirebaseAuth.currentUser
          ? await FirebaseAuth.currentUser.getIdToken()
          : "";
        return {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
    })
  );

  // http link
  const apiLink = createHttpLink({
    uri: process.env.HASURA_API,
  });

  // error link
  const errorLink = onError((error) => {
    if (process.env.DEV_MODE !== "production") {
      logErrorMessages(error);
    }
  });

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === "OperationDefinition" && operation === "subscription";
    },
    wsLink, // subscription to graphqlwslink
    concat(asyncAuthMiddleware, apiLink) // other queries concat with middleware
  );

  return Object.assign(
    // General options.
    {
      link: from([errorLink, link]),
      connectToDevTools: false,
      cache: new InMemoryCache({
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
            fields: {
              Event_to_Evaluation: {
                keyFields: ["uuid"],
                // replace existing array with incoming array
                merge(existing = [], incoming) {
                  return [...incoming];
                },
              },
            },
          },
          Event_Evaluation: {
            keyFields: ["uuid"],
            merge: true,
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
            keyFields: ["c_mem_id"],
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
            keyFields: ["c_mem_id"],
          },
          Event_Evaluation_Account: {
            keyFields: ["account_uuid"],
          },
          Event_Prepaid: {
            keyFields: ["uuid"],
          },
          tbl_sel_acc_type: {
            keyFields: ["c_type"],
          },
          HTX_News: {
            keyFields: ["NewsID"],
          },
          HTX_Article: {
            keyFields: ["ArticleID"],
          },
          HTX_About_Article: {
            keyFields: ["ArticleID"],
          },
          Subscription: {
            fields: {
              tbl_act_reg: {
                merge(existing = [], incoming) {
                  return [...existing, ...incoming];
                },
              },
            },
          },
        },
      }),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: "cache-and-network",
        },
      },
    },
    // Specific Quasar mode options.
    process.env.MODE === "spa"
      ? {
          //
        }
      : {},
    process.env.MODE === "ssr"
      ? {
          //
        }
      : {},
    process.env.MODE === "pwa"
      ? {
          //
        }
      : {},
    process.env.MODE === "bex"
      ? {
          //
        }
      : {},
    process.env.MODE === "cordova"
      ? {
          //
        }
      : {},
    process.env.MODE === "capacitor"
      ? {
          //
        }
      : {},
    process.env.MODE === "electron"
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
    process.env.MODE === "ssr" && process.env.SERVER
      ? {
          ssrMode: true,
        }
      : {},
    // For ssr mode, when on client.
    process.env.MODE === "ssr" && process.env.CLIENT
      ? {
          ssrForceFetchDelay: 100,
        }
      : {}
  );
}
