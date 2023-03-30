import { boot } from "quasar/wrappers";
import axios from "axios";
import { FirebaseAuth } from "boot/firebase";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  // baseURL: process.env.NODE_ENV == "development" ? "http://localhost:1337" : "",
  //baseURL: "https://cciycgw.eastasia.cloudapp.azure.com/v1/graphql/",
  baseURL: "https://hasura.cciyc.com:4430/v1/graphql/",
});

api.interceptors.request.use(async (config) => {
  var token = await FirebaseAuth.currentUser.getIdToken();
  config.headers["Authorization"] = `Bearer ${token}`
  config.params = config.params || {};
  // config.params["locale"] = api.defaults.locale;
  return config;
});

const API_URL = 'https://api.openai.com/v1/chat/completions';
const chatAPI = axios.create({
  baseURL: API_URL,
  headers: {
    common: {
      "content-type": "application/json",
    },
  },
})

// const API_KEY = process.env.OPENAI_APIKEY;
const API_KEY = ""
chatAPI.interceptors.request.use(async (config) => {
  config.headers["Authorization"] = `Bearer ${API_KEY}`
  config.params = config.params || {};
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

  app.config.globalProperties.$chatAPI = chatAPI;
});

export { api, chatAPI };
