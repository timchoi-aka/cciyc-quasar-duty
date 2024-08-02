import { computed, ref, watch } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag";

// Function to provide inventory data
export function useInventoryProvider(options = {}) {
  // Destructure galleryID from options, default to a new ref if not provided
  const { ID = ref() } = options;

  const result = ref(null);
  const loading = computed(() => awaitNumber.value > 0);
  const awaitNumber = ref(0);
  const message = ref();
  const idList = computed(() => result.value?.Inventory.map((i) => i.ID));
  // GraphQL query string

  const GET_INVENTORY_BY_ID = gql`
    query GET_INVENTORY_BY_ID($ID: String = "") {
      Inventory_by_pk(ID: $ID) {
        ID
        c_approvedByUser
        c_funding
        c_location
        c_model
        d_approveDate
        c_createdByUser
        b_approve
        c_name
        d_createDate
        d_purchase
        i_qty
        f_cost
        Inventory_to_Destroy {
          ID
          b_approve
          c_approveByUser
          c_createByUser
          c_destroy_reason
          d_approve
          d_createDate
          d_destroy
          i_destroy_quantity
          uuid
        }
      }
    }
  `;

  const DESTROY_INVENTORY = gql`
    mutation DESTROY_INVENTORY(
      $logObject: Log_insert_input! = {}
      $objects: [Inventory_Destroy_insert_input!] = {}
    ) {
      insert_Inventory_Destroy(
        objects: $objects
        if_matched: {
          match_columns: uuid
          update_columns: [
            ID
            i_destroy_quantity
            b_approve
            c_approveByUser
            c_createByUser
            c_destroy_reason
            d_approve
            d_createDate
            d_destroy
          ]
        }
      ) {
        affected_rows
        returning {
          ID
          i_destroy_quantity
          b_approve
          c_approveByUser
          c_createByUser
          c_destroy_reason
          d_approve
          d_createDate
          d_destroy
          uuid
        }
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
    }
  `;

  const UNDESTROY_INVENTORY = gql`
    mutation UNDESTROY_INVENTORY(
      $logObject: Log_insert_input! = {}
      $uuid: uniqueidentifier = ""
    ) {
      delete_Inventory_Destroy_by_pk(uuid: $uuid) {
        ID
        b_approve
        c_approveByUser
        c_createByUser
        c_destroy_reason
        d_approve
        d_createDate
        d_destroy
        i_destroy_quantity
        uuid
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
    }
  `;

  const ADD_LOCATION = gql`
    mutation addLocation($c_location: String = "") {
      insert_Inventory_Location_one(object: { c_location: $c_location }) {
        c_location
      }
    }
  `;

  const DELETE_LOCATION = gql`
    mutation delLocation($c_location: String = "") {
      delete_Inventory_Location_by_pk(c_location: $c_location) {
        c_location
      }
    }
  `;

  const GET_ALL_INVENTORY = gql`
    query AllInventory {
      Inventory(order_by: { ID: asc }) {
        f_cost
        d_purchase
        c_name
        c_model
        c_location
        c_funding
        ID
        i_qty
        c_createdByUser
        d_createDate
        b_approve
        c_approvedByUser
        d_approveDate
        Inventory_to_Destroy {
          ID
          i_destroy_quantity
          b_approve
          c_approveByUser
          c_createByUser
          c_destroy_reason
          d_approve
          d_createDate
          d_destroy
          uuid
        }
      }
      Inventory_Location {
        c_location
      }
    }
  `;

  const UPSERT_INVENTORY = gql`
    mutation Account_UpsertInventory(
      $logObject: Log_insert_input! = {}
      $objects: [Inventory_insert_input!] = {}
    ) {
      insert_Inventory(
        objects: $objects
        if_matched: {
          match_columns: ID
          update_columns: [
            f_cost
            d_purchase
            c_name
            c_model
            c_location
            c_funding
            i_qty
            c_createdByUser
            d_createDate
            b_approve
            c_approvedByUser
            d_approveDate
          ]
        }
      ) {
        affected_rows
        returning {
          ID
          f_cost
          d_purchase
          c_name
          c_model
          c_location
          c_funding
          i_qty
          c_createdByUser
          d_createDate
          b_approve
          c_approvedByUser
          d_approveDate
          Inventory_to_Destroy {
            ID
            b_approve
            c_approveByUser
            c_destroy_reason
            c_createByUser
            d_approve
            d_createDate
            d_destroy
            i_destroy_quantity
            uuid
          }
        }
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
    }
  `;

  const DELETE_INVENTORY = gql`
    mutation deleteInventory(
      $logObject: Log_insert_input! = {}
      $ID: [String!] = ""
    ) {
      delete_Inventory(where: { ID: { _in: $ID } }) {
        affected_rows
        returning {
          ID
        }
      }
      delete_Inventory_Destroy(where: { ID: { _in: $ID } }) {
        affected_rows
        returning {
          uuid
        }
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
    }
  `;

  // Function to upsert inventory records
  /**
   * @param {Object} upsertInventory - The inventory object to upsert
   * @param {Object} logObject - The log object to insert
   * @returns {
   * void
   * }
   */
  const upsertInventory = async (options = {}) => {
    // Destructure objects and logObject from options
    const { objects = ref([]), logObject = ref({}) } = options;

    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await UpsertInventory({
        objects: objects.value,
        logObject: logObject.value,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  const addLocation = async (options = {}) => {
    // Destructure objects and logObject from options
    const { c_location = ref("") } = options;

    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await AddLocation({
        c_location: c_location.value,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  const deleteLocation = async (options = {}) => {
    // Destructure objects and logObject from options
    const { c_location = ref("") } = options;

    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await DeleteLocation({
        c_location: c_location.value,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  const destroyInventory = async (options = {}) => {
    // Destructure objects and logObject from options
    const { objects = ref([]), logObject = ref() } = options;

    // Increment the number of pending async operations
    awaitNumber.value++;

    try {
      // Call the toggleVisibility mutation
      await DestroyInventory({
        objects: objects.value,
        logObject: logObject.value,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  const undestroyInventory = async (options = {}) => {
    // Destructure objects and logObject from options
    const { uuid = ref(), logObject = ref() } = options;

    // Increment the number of pending async operations
    awaitNumber.value++;

    try {
      // Call the toggleVisibility mutation
      await UndestroyInventory({
        uuid: uuid.value,
        logObject: logObject.value,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  const deleteInventory = async (options = {}) => {
    // Destructure objects and logObject from options
    const { ID = ref([]), logObject = ref() } = options;

    // Increment the number of pending async operations
    awaitNumber.value++;

    try {
      // Call the toggleVisibility mutation
      await DeleteInventory({
        ID: ID.value,
        logObject: logObject.value,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  const { mutate: AddLocation, onDone: addLocation_Completed } = useMutation(
    ADD_LOCATION,
    {
      update: (cache, { data: { insert_Inventory_Location_one } }) => {
        // Read the data from our cache for this query.
        const existingData = cache.readQuery({
          query: GET_ALL_INVENTORY,
        });

        if (existingData) {
          let updatedLocation = [...existingData.Inventory_Location];
          updatedLocation.push(insert_Inventory_Location_one);
          // Write our data back to the cache.
          cache.writeQuery({
            query: GET_ALL_INVENTORY,
            data: {
              Inventory: [...existingData.Inventory],
              Inventory_Location: updatedLocation,
            },
          });

          result.value = {
            Inventory: existingData.Inventory,
            Inventory_Location: updatedLocation,
          };
        }
      },
    }
  );

  const { mutate: DeleteLocation, onDone: deleteLocation_Completed } =
    useMutation(DELETE_LOCATION, {
      update: (cache, { data: { delete_Inventory_Location_by_pk } }) => {
        // Read the data from our cache for this query.
        const existingData = cache.readQuery({
          query: GET_ALL_INVENTORY,
        });

        if (existingData) {
          const index = existingData.Inventory_Location.findIndex(
            (x) => x.c_location == delete_Inventory_Location_by_pk.c_location
          );

          // delete the location from cache
          let updatedLocation = [...existingData.Inventory_Location];
          updatedLocation.splice(index, 1);
          // Write our data back to the cache.
          cache.writeQuery({
            query: GET_ALL_INVENTORY,
            data: {
              Inventory: existingData.Inventory,
              Inventory_Location: updatedLocation,
            },
          });

          result.value = {
            Inventory: existingData.Inventory,
            Inventory_Location: updatedLocation,
          };
        }
      },
    });

  addLocation_Completed((res) => {
    if (res.data) {
      message.value =
        "新增位置 - " +
        res.data.insert_Inventory_Location_one.c_location?.trim() +
        "成功。";
      setTimeout(() => {
        (message.value = ""), 3000;
      });
    }
  });

  deleteLocation_Completed((res) => {
    if (res.data) {
      message.value =
        "刪除位置 - " +
        res.data.delete_Inventory_Location_by_pk.c_location +
        "成功。";
      setTimeout(() => {
        (message.value = ""), 3000;
      });
    }
  });

  const { mutate: DestroyInventory, onDone: DestroyInventory_Completed } =
    useMutation(DESTROY_INVENTORY, {
      update: (cache, { data: { insert_Inventory_Destroy } }) => {
        // Read the data from our cache for this query.
        const existingData = cache.readQuery({
          query: GET_ALL_INVENTORY,
        });

        if (existingData) {
          let updatedInventories = structuredClone(existingData.Inventory);

          let index = updatedInventories.findIndex(
            (x) =>
              x.ID?.trim() == insert_Inventory_Destroy.returning[0].ID?.trim()
          );

          let destroyIndex = updatedInventories[
            index
          ].Inventory_to_Destroy.findIndex(
            (element) =>
              element.uuid == insert_Inventory_Destroy.returning[0].uuid
          );

          if (destroyIndex > -1) {
            updatedInventories[index].Inventory_to_Destroy[destroyIndex] =
              insert_Inventory_Destroy.returning[0];
          } else {
            updatedInventories[index].Inventory_to_Destroy.push({
              ...insert_Inventory_Destroy.returning[0],
            });
          }

          // Write our data back to the cache.
          cache.writeQuery({
            query: GET_ALL_INVENTORY,
            data: {
              Inventory: [...updatedInventories],
              Inventory_Location: existingData.Inventory_Location,
            },
          });
        }
      },
    });

  const { mutate: UndestroyInventory, onDone: UndestroyInventory_Completed } =
    useMutation(UNDESTROY_INVENTORY, {
      update: (cache, { data: { delete_Inventory_Destroy_by_pk } }) => {
        // Read the data from our cache for this query.
        const existingData = cache.readQuery({
          query: GET_ALL_INVENTORY,
        });

        if (existingData) {
          let updatedInventories = structuredClone(existingData.Inventory);

          let index = updatedInventories.findIndex(
            (x) => x.ID?.trim() == delete_Inventory_Destroy_by_pk.ID?.trim()
          );

          let destroyIndex = updatedInventories[
            index
          ].Inventory_to_Destroy.findIndex(
            (element) => element.uuid == delete_Inventory_Destroy_by_pk.uuid
          );

          updatedInventories[index].Inventory_to_Destroy.splice(
            destroyIndex,
            1
          );

          // Write our data back to the cache.
          cache.writeQuery({
            query: GET_ALL_INVENTORY,
            data: {
              Inventory: [...updatedInventories],
              Inventory_Location: existingData.Inventory_Location,
            },
          });
        }
      },
    });

  UndestroyInventory_Completed((res) => {
    if (res.data) {
      message.value = "取消報銷資產成功。";
      setTimeout(() => {
        (message.value = ""), 3000;
      });
    }
  });

  DestroyInventory_Completed((res) => {
    if (res.data) {
      message.value = "報銷資產成功。";
      setTimeout(() => {
        (message.value = ""), 3000;
      });
    }
  });

  const { mutate: DeleteInventory, onDone: DeleteInventory_Completed } =
    useMutation(DELETE_INVENTORY, {
      update: (cache, { data: { delete_Inventory } }) => {
        // Read the data from our cache for this query.
        const existingData = cache.readQuery({
          query: GET_ALL_INVENTORY,
        });

        if (existingData) {
          // Filter out the deleted gallery
          // delete the inventory ID from cache
          const updatedInventories = existingData.Inventory.filter(
            (inventory) =>
              !delete_Inventory.returning.some((d) => d.ID === inventory.ID)
          );

          // Write our data back to the cache.
          cache.writeQuery({
            query: GET_ALL_INVENTORY,
            data: {
              Inventory: updatedInventories,
            },
          });
        }
      },
    });

  DeleteInventory_Completed((res) => {
    if (res.data) {
      message.value = "刪除資產成功。";
      setTimeout(() => {
        (message.value = ""), 3000;
      });
    }
  });
  const { mutate: UpsertInventory, onDone: UpsertInventory_Completed } =
    useMutation(UPSERT_INVENTORY, {
      update: (cache, { data: { insert_Inventory } }) => {
        // Read the data from our cache for this query.
        const existingData = cache.readQuery({
          query: GET_ALL_INVENTORY,
        });

        if (existingData) {
          // update inventory cache

          let index = existingData.Inventory.findIndex(
            (x) => x.ID == insert_Inventory.returning[0].ID
          );

          let updatedInventories = [...existingData.Inventory];
          if (index > -1) {
            updatedInventories[index] = insert_Inventory.returning[0];
          } else {
            updatedInventories.push(insert_Inventory.returning[0]);
          }
          // Write our data back to the cache.
          cache.writeQuery({
            query: GET_ALL_INVENTORY,
            data: {
              Inventory: [...updatedInventories],
              Inventory_Location: existingData.Inventory_Location,
            },
          });
        }
      },
    });

  UpsertInventory_Completed((res) => {
    if (res.data) {
      message.value = "新增/修改資產成功。";
      setTimeout(() => {
        (message.value = ""), 3000;
      });
    }
  });

  const { onResult: onResultAll, refetch: refetchAll } = useQuery(
    GET_ALL_INVENTORY,
    {
      enabled: computed(() => ID.value == null),
    }
  );

  const { onResult: onResultById, refetch: refetchById } = useQuery(
    GET_INVENTORY_BY_ID,
    () => ({
      ID: ID.value,
    }),
    {
      enabled: computed(() => ID.value != null),
    }
  );

  onResultAll((res) => {
    if (res.data) {
      result.value = res.data;
    }
  });

  onResultById((res) => {
    if (res.data?.Inventory_by_pk) {
      result.value = res.data.Inventory_by_pk;
    }
  });

  watch(ID, (newValue) => {
    if (newValue) {
      refetchById();
    } else {
      refetchAll();
    }
  });

  // Return the provided data and functions
  return {
    result,
    loading,
    message,
    idList,
    upsertInventory,
    deleteInventory,
    destroyInventory,
    undestroyInventory,
    addLocation,
    deleteLocation,
  };
}
