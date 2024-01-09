import { ref, computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag"

// Function to provide gallery data
export function useLogProvider(options = {}) {
  // Destructure galleryID from options, default to a new ref if not provided
  const { module = ref() } = options

  // Ref to keep track of the number of pending async operations
  const awaitNumber = ref(0);

  // Computed property that indicates whether there are any pending async operations
  const loading = computed(() => awaitNumber.value > 0);

  // Ref to store the result of the async operations
  const result = ref([]);

  // GraphQL query string
  let GET_LOG = gql`
    query GET_LOG($module: String!) {
      Log(where: {module: {_eq: $module}}) {
        action
        datetime
        log_id
        module
        username
      }
    }`

  // Mutation for adding log
  const ADD_LOG = gql`
    mutation AddLog($logObject: Log_insert_input! = {}) {
      insert_Log_one(object: $logObject) {
        action
        datetime
        log_id
        module
        username
      }
    }`;


  // Use the useMutation hook to create a deleteGallery mutation
  const { mutate: addLog, onError: onError_addLog } = useMutation(ADD_LOG, {
    update: (cache, { data: { insert_Log_one } }) => {
      // Read the data from our cache for this query.
      const existingData = cache.readQuery({
        query: GET_LOG,
        variables: { module: module.value }
      });

      if (existingData) {
        // Filter out the deleted gallery
        const updatedLog = existingData.Log.filter(
          log => log.log_id !== insert_Log_one.log_id
        );

        // Write our data back to the cache.
        cache.writeQuery({
          query: GET_LOG,
          variables: { module: module.value },
          data: {
            ...existingData,
            Log: updatedLog
          },
        });
      }
    },
  });

  // Function to toggle the visibility of a gallery
  const addNewLog = async (log) => {
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await addLog({
        logObject: log,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  onError_addLog((error) => {
    // Handle error
    console.error("新增記錄失敗", error)
  });

  // Function to execute the query
  const execute = async () => {
    awaitNumber.value++;
    const { onResult } = useQuery(GET_LOG,
      () => ({
        module: module.value,
      }));

    onResult((res) => {
      if (res.data) {
        result.value = [];
        res.data.Log.forEach((data) => {
          result.value.push({
            action: data.action,
            datetime: data.datetime,
            log_id: data.log_id,
            module: data.module,
            username: data.username,
          })
        })
      }
      awaitNumber.value--;
    })
  }

  // Execute the query
  execute();

  // Return the provided data and functions
  return { result, loading, addNewLog};
}
