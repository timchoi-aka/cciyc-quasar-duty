//import User from "components/class/user";
import { FirebaseFunctions } from "boot/firebase";
import { ref } from "vue";
import { httpsCallable } from "@firebase/functions";

export function useNotifier(payload) {
  const { topic, data } = payload;
  /*
  const userMapping = async () => { User.loadPermUsers().then((users) => users.reduce((acc, { name, uid }) => {
    acc[name] = uid;
    return acc;
  }, {}))};
  console.log("useNotifier", topic, data, userMapping);
  */
  const result = ref([]);

  // Function to execute the query
  const execute = async () => {
    const notifyUser = httpsCallable(FirebaseFunctions,
      "notification-notifyUser"
    );

    result.value = notifyUser({ topic: topic, data: data })
  }

  // Execute the query
  execute();

  return { result };
}
