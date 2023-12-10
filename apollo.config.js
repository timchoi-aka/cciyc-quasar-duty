'use strict'
/* eslint-env node */
// See https://www.apollographql.com/docs/devtools/apollo-config/
module.exports = {
  client: {
    service: {
      name: 'cciyc-api',
      // azure endpoint
      //url: 'https://cciycgw.eastasia.cloudapp.azure.com/v1/graphql/',

      // production endpoint
      // url: 'https://hasura.cciyc.com:4430/v1/graphql/',

      // offline development endpoint
      // url: process.env.NODE_ENV == "development" ? "https://hasuradev.cciyc.com/v1/graphql/" : "https://hasura.cciyc.com:4430/v1/graphql/",

      // local development endpoint
      url: process.env.NODE_ENV == "development" ? "https://hasuradev.aka-technology.com/v1/graphql/" : "https://hasura.cciyc.com:4430/v1/graphql/",
    },
    // Files processed by the extension
    includes: ['src/**/*.vue', 'src/**/*.js'],
  },
}
