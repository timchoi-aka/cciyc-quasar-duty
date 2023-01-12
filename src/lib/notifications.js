export default {
  notifyClientError
}

function notifyClientError(error) {
  if (error.graphQLErrors && error.graphQLErrors[0].extensions.code == "invalid-jwt") {
    userProfileLogout()
      .then(() => {
        $q.notify({ message: "系統逾時，自動登出." });
      })
      .catch((error) => console.log("error", error));
  } else {
    console.error(error)
  }
}
