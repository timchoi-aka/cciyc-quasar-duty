import { ref, computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag"

// Function to provide gallery data
export function useMemberProvider(options = {}) {
  // Destructure galleryID from options, default to a new ref if not provided
  const { c_mem_id = ref(), galleryID = ref() } = options

  // Ref to keep track of the number of pending async operations
  const awaitNumber = ref(0);

  // Computed property that indicates whether there are any pending async operations
  const loading = computed(() => awaitNumber.value > 0);

  // Ref to store the result of the async operations
  const result = ref([]);

  // GraphQL query string
  let GET_MEMBER = gql`
  query GetMember($c_mem_id: String = "") {
    Member_by_pk(c_mem_id: $c_mem_id) {
      c_mem_id
      c_mobile
      c_name
      c_name_other
      c_sex
      ID
    }
  }`;

  const onResult = (callback) => {
    if (result.value) {
      callback(result.value);
    }
  }

  // Function to execute the query
  const execute = async () => {
    awaitNumber.value++;
    const { onResult } = useQuery(GET_MEMBER,
      () => (c_mem_id.value?{
        c_mem_id: c_mem_id.value,
      }: {}));


    onResult((res) => {
      if (res.data) {
        result.value = res.data.Member_by_pk;
        /* result.value = [];
        res.data.HTX_Gallery.forEach((data) => {
          result.value.push({
            AddTime: new Date(data.AddTime),
            CoverPic: data.CoverPic? (data.CoverPic.includes("googleapis")? data.CoverPic: eventGalleryServerPath + data.CoverPic): null,
            GalleryName: data.GalleryName,
            GalleryNameEN: data.GalleryNameEN,
            IsShow: data.IsShow,
            Obsolete: data.CoverPic? !data.CoverPic.includes("googleapis"): false,
            GalleryID: data.GalleryID,
          })
        })*/
      }
      awaitNumber.value--;
    })
  }

  // Execute the query
  execute();

  // Return the provided data and functions
  return { result, loading, onResult };
}
