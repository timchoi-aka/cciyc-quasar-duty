import { CloudFunctions } from "boot/firebase";
import { ref } from "vue";
import { httpsCallable } from "@firebase/functions";

export function useNotifier(payload) {
  const { topic, data } = payload;

  const result = ref([]);

  // Function to execute the query
  const execute = async () => {
    const notifyUser = httpsCallable(CloudFunctions,
      "notification-notifyUser"
    );

    result.value = notifyUser({ topic: topic, data: data })
  }

  // Execute the query
  execute();

  return { result };
}
