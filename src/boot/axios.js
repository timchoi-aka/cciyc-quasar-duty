import { boot } from "quasar/wrappers";
import axios from "axios";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  // baseURL: process.env.NODE_ENV == "development" ? "http://localhost:1337" : "",

  // application gateway
  baseURL: "https://cciycgw.eastasia.cloudapp.azure.com/v1/graphql/",
  
  defaults: {
    locale: "zh-Hant-HK",
  },
  headers: {
    common: {
      "content-type": "application/json",
    },
  },
});

const phAPI = axios.create({
  headers: {
    common: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  }
})

const pdfAPI = axios.create({
  headers: {
    common: {
      "content-type": "application/pdf",
    },
  }
})

api.interceptors.request.use((config) => {
  config.params = config.params || {};
  // config.params["locale"] = api.defaults.locale;
  return config;
});

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  app.config.globalProperties.$phAPI = phAPI;
  app.config.globalProperties.$pdfAPI = pdfAPI;
});

export { api, phAPI, pdfAPI };
