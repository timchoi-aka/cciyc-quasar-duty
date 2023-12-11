import { date as qdate } from "quasar";
import { ref, computed } from "vue";
import dateUtil from "src/lib/date.js";
import { useQuery } from "@vue/apollo-composable";
import { gql } from "graphql-tag"

const eventGalleryServerPath = "https://www2.cciyc.com/UPFile/Gallery/CoverPic/";
const classGalleryServerPath = "https://www2.cciyc.com/UPFile/ClassGallery/CoverPic/";
// retrieve duty of all PermUsers between startDate and endDate
export function useGalleryProvider(options = {}) {
  const { galleryID = ref() } = options;
  const awaitNumber = ref(0);
  const loading = computed(() => awaitNumber.value > 0);
  const result = ref([]);


  async function execute() {
    awaitNumber.value++;
    let queryString = "";
    if (galleryID.value) {
      queryString = gql`
        query getGallery($galleryID: Int) {
          HTX_Gallery(where: {GalleryID: {_eq: $galleryID}}) {
            AddTime
            ClassID
            CoverPic
            CoverPic2
            GalleryDetail
            GalleryDetailEN
            GalleryName
            GalleryNameEN
            IsShow
            GalleryID
          }
        }`
      } else {
        queryString = gql`
        query getGallery {
          HTX_Gallery {
            AddTime
            ClassID
            CoverPic
            CoverPic2
            GalleryDetail
            GalleryDetailEN
            GalleryName
            GalleryNameEN
            IsShow
            GalleryID
          }
        }
        `
      }
    const { onResult } = useQuery(queryString,
      () => (galleryID.value?{
        galleryID: galleryID.value,
      }: {}))


    onResult((res) => {
      if (res.data) {
        res.data.HTX_Gallery.forEach((data) => {
          result.value.push({
            AddTime: new Date(data.AddTime),
            ClassID: data.ClassID == 1? "活動": "班組",
            CoverPic: data.ClassID == 1? eventGalleryServerPath + data.CoverPic: classGalleryServerPath + data.CoverPic,
            GalleryName: data.GalleryName,
            GalleryNameEN: data.GalleryNameEN,
            IsShow: data.IsShow,
            GalleryID: data.GalleryID,
          })
        })
        awaitNumber.value--;
      }
    })
  }

  execute();

  return { result, loading };
}
