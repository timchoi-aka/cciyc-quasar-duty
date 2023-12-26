import { ref, computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag"
import axios from 'axios';
import { useApolloClient } from '@vue/apollo-composable';

const eventGalleryPhotoServerPath = "https://www2.cciyc.com/UPFile/Gallery/PhotoPic/";
//const baseURL = process.env.NODE_ENV == "development"? "http://localhost:5001/manage-hr/asia-east2/file-deleteFileFromStorage" : "https://asia-east2-manage-hr.cloudfunctions.net/file-deleteFileFromStorage";
const baseURL = "https://asia-east2-manage-hr.cloudfunctions.net/file-deleteFileFromStorage";

// retrieve duty of all PermUsers between startDate and endDate
export function useGalleryPhotoProvider(options = {}) {
  const { galleryID = ref() } = options
  const awaitNumber = ref(0);
  const loading = computed(() => awaitNumber.value > 0);
  const result = ref([]);
  const params = ref({
    queryVariables: {
      galleryID: galleryID.value,
    }
  })
  const { resolveClient } = useApolloClient();
  const client = resolveClient()

  const { mutate: deleteGalleryPhoto, onError: onError_deleteGalleryPhoto } = useMutation(gql`
    mutation delGallery($PhotoID: Int!) {
      delete_HTX_Gallery_Photo_by_pk(PhotoID: $PhotoID) {
        PhotoID
      }
    }`,
    {
      // Update function to modify the cache after the mutation
      update: (cache, { data: { delete_HTX_Gallery_Photo_by_pk } }) => {
        // Read the data from our cache for this query.
        const existingPhotos = cache.readQuery({
          query: GET_GALLERIES_PHOTOS,
          variables: params.value.queryVariables,
        });

        // Check if the data is in the cache
        if (existingPhotos) {
          // Remove the deleted photo from the cache
          const updatedPhotos = existingPhotos.HTX_Gallery_Photo.filter(
            photo => photo.PhotoID !== delete_HTX_Gallery_Photo_by_pk.PhotoID
          );

          // Write our data back to the cache.
          cache.writeQuery({
            query: GET_GALLERIES_PHOTOS,
            variables: params.value.queryVariables,
            data: { ...existingPhotos, HTX_Gallery_Photo: updatedPhotos },
          });

          //updateResultFromCache(cache)
        }
      },
    });

  const { mutate: updateOrientation, onError: onError_updateOrientation } = useMutation(gql`
    mutation UpdateOrientation($Orientation: Int!, $PhotoID: Int!) {
      update_HTX_Gallery_Photo_by_pk(pk_columns: {PhotoID: $PhotoID}, _set: {Orientation: $Orientation}) {
        PhotoID
        Orientation
      }
    }`,
    {
      update: (cache, { data: { update_HTX_Gallery_Photo_by_pk } }) => {
        const existingPhotos = cache.readQuery({
          query: GET_GALLERIES_PHOTOS,
          variables: params.value.queryVariables,
        });

        if (existingPhotos) {
          const updatedPhotos = existingPhotos.HTX_Gallery_Photo.map(photo =>
            photo.PhotoID === update_HTX_Gallery_Photo_by_pk.PhotoID
              ? { ...photo, Orientation: update_HTX_Gallery_Photo_by_pk.Orientation }
              : photo
          );

          cache.writeQuery({
            query: GET_GALLERIES_PHOTOS,
            variables: params.value.queryVariables,
            data: { HTX_Gallery_Photo: updatedPhotos },
          });
        }
      },
    }
  );

  const { mutate: toggleVisibility, onError: onError_toggleVisibility } = useMutation(gql`
    mutation toggleVisibility($IsShow: Int!, $PhotoID: Int!) {
      update_HTX_Gallery_Photo_by_pk(pk_columns: {PhotoID: $PhotoID}, _set: {IsShow: $IsShow}) {
        PhotoID
        IsShow
      }
    }`,
    {
      // Update function to modify the cache after the mutation
      update: (cache, { data: { update_HTX_Gallery_Photo_by_pk } }) => {
        // Read the data from our cache for this query.
        const existingPhotos = cache.readQuery({
          query: GET_GALLERIES_PHOTOS,
          variables: params.value.queryVariables,
        });

        // Check if the data is in the cache
        if (existingPhotos) {
          // Update the visibility of the photo in the cache
          const updatedPhotos = existingPhotos.HTX_Gallery_Photo.map(photo =>
            photo.PhotoID === update_HTX_Gallery_Photo_by_pk.PhotoID
              ? { ...photo, IsShow: update_HTX_Gallery_Photo_by_pk.IsShow }
              : photo
          );

          // Write our data back to the cache.
          cache.writeQuery({
            query: GET_GALLERIES_PHOTOS,
            variables: params.value.queryVariables,
            data: { ...existingPhotos, HTX_Gallery_Photo: updatedPhotos },
          });

        }
      }
    });

  // Define the addGalleryPhoto mutation
  const ADD_GALLERY_PHOTO_MUTATION = gql`
  mutation AddGalleryPhoto($objects: [HTX_Gallery_Photo_insert_input!] = {}) {
    insert_HTX_Gallery_Photo(objects: $objects) {
      returning {
        AddTime
        GalleryID
        IsShow
        PhotoID
        PhotoName
        PhotoUrl
        Orientation
      }
    }
  }`;

  // Use the useMutation hook to create an addGalleryPhoto mutation
  const { mutate: addGalleryPhoto, onError: onError_addGalleryPhoto } = useMutation(ADD_GALLERY_PHOTO_MUTATION, {
    // Update function to modify the cache after the mutation
    update: (cache, { data: { insert_HTX_Gallery_Photo } }) => {
      // Read the data from our cache for this query.
      const existingPhotos = cache.readQuery({ query: GET_GALLERIES_PHOTOS, variables: params.value.queryVariables }) ?? { HTX_Gallery_Photo: [] };

      // Add the new photo to the cache
      const updatedPhotos = [...existingPhotos.HTX_Gallery_Photo, ...insert_HTX_Gallery_Photo.returning];

      // Write our data back to the cache.
      cache.writeQuery({
        query: GET_GALLERIES_PHOTOS,
        variables: params.value.queryVariables,
        data: { ...existingPhotos, HTX_Gallery_Photo: updatedPhotos },
      });
    },
  });

  const GET_GALLERIES_PHOTOS = gql`
    query getGalleryPhoto($galleryID: Int) {
      HTX_Gallery_Photo(where: {GalleryID: {_eq: $galleryID}}) {
        AddTime
        GalleryID
        IsShow
        PhotoName
        PhotoUrl
        PhotoID
        Orientation
      }
    }`

  const addGalleryPhotos = async (objects) => {
    awaitNumber.value++;
    try {
      await addGalleryPhoto({
        objects: objects
      });
    } catch (error) {
      console.error(error);
    } finally {
      awaitNumber.value--;
    }
  };

  const deleteGalleryPhotoById = async (PhotoID) => {
    awaitNumber.value++;

    try {
       // Now use the apolloClient instance to read from the cache
      const existingPhotos = client.cache.readQuery({
        query: GET_GALLERIES_PHOTOS,
        variables: params.value.queryVariables,
      });

      const fullpath = existingPhotos.HTX_Gallery_Photo.find((element) => element.PhotoID == PhotoID).PhotoUrl;
      const path = fullpath.split('/').slice(4).join('/');

      const response = await axios.delete(baseURL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          path: path,
      }})

      await deleteGalleryPhoto({
        PhotoID: PhotoID
      });
    } catch (error) {
      console.error(error);
    } finally {
      awaitNumber.value--;
    }
  };

  const toggleVisibilityById = async (PhotoID) => {
    awaitNumber.value++;
    try {
      await toggleVisibility({
        PhotoID: PhotoID,
        IsShow: result.value.find((element) => element.PhotoID == PhotoID).IsShow == 1? 0: 1
      });
    } catch (error) {
      console.error(error);
    } finally {
      awaitNumber.value--;
    }
  };

  const updateOrientationById = async (options) => {
    const { PhotoID, Orientation } = options;
    awaitNumber.value++;
    try {
      await updateOrientation({
        PhotoID: PhotoID,
        Orientation: Orientation
      });
    } catch (error) {
      console.error(error);
    } finally {
      awaitNumber.value--;
    }
  };

  /**
   * error handling
   */
  onError_deleteGalleryPhoto((error) => {

    console.error("刪除相片失敗", error)
  });

  onError_toggleVisibility((error) => {
    console.error("隱藏顯示相片失敗", error)
  });

  // Handle error for addGalleryPhoto
  onError_addGalleryPhoto((error) => {
    console.error("Adding gallery photo failed", error)
  });

  // Handle error for updateOrientation
  onError_updateOrientation((error) => {
    console.error("Updating orientation failed", error)
  });

  async function execute() {
    awaitNumber.value++;

    const { onResult } = useQuery(GET_GALLERIES_PHOTOS, params.value.queryVariables)

    onResult((res) => {
      result.value = []
      if (res.data) {
        res.data.HTX_Gallery_Photo.forEach((data) => {
          result.value.push({
            AddTime: new Date(data.AddTime),
            GalleryID: data.GalleryID,
            PhotoID: data.PhotoID,
            IsShow: data.IsShow,
            PhotoUrl: data.PhotoUrl? (data.PhotoUrl.includes("googleapis")? data.PhotoUrl: eventGalleryPhotoServerPath + data.PhotoUrl): null,
            PhotoName: data.PhotoName,
            Obsolete: data.PhotoUrl? !data.PhotoUrl.includes("googleapis"): false,
            Orientation: data.Orientation? data.Orientation: 0,
          })
        })
      }
      awaitNumber.value--;
    })
  }

  execute();

  return { result, loading, deleteGalleryPhotoById, toggleVisibilityById, addGalleryPhotos, updateOrientationById };
}
