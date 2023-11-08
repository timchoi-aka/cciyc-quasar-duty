'use strict'
/* eslint-env node */
// See https://www.apollographql.com/docs/devtools/apollo-config/
module.exports = {
  client: {
    service: {
      name: 'cciyc-api',
      //url: 'https://cciycgw.eastasia.cloudapp.azure.com/v1/graphql/',
      // url: 'https://hasura.cciyc.com:4430/v1/graphql/',
      url: process.env.NODE_ENV == "development" ? "https://hasuradev.cciyc.com/v1/graphql/" : "https://hasura.cciyc.com:4430/v1/graphql/",
    },
    // Files processed by the extension
    includes: ['src/**/*.vue', 'src/**/*.js'],
  },
}
