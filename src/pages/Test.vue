<template>
This is a test page for development
options: {{ displayOptions }}
<q-input v-model="memberID" label="c_mem_id"/>
<q-input v-model="mobile" label="mobile"/>
<q-toggle v-model="displayOptions.loadReceipt" label="顯示收據"/>
<q-toggle v-model="displayOptions.loadDetailReceipt" label="詳細收據"/>
<q-toggle v-model="displayOptions.loadMembership" label="顯示會藉"/>
<q-toggle v-model="displayOptions.loadDetail" label="詳細資料"/>
<q-toggle v-model="displayOptions.loadHousekeep" label="輔助資料"/>
<q-toggle v-model="displayOptions.loadRelation" label="關聯會員"/>
<q-uploader
    url="http://localhost:5001/manage-hr/asia-east2/file-saveFileToStorage"
    color="teal"
    flat
    bordered
    multiple
    style="max-width: 300px"
  />
<q-btn label="搜尋" @click="search"/>
<q-input type="text" v-model="inputText" label="青年AI"/>
<q-btn label="聊天" @click="chat"/>
{{  answer }} 
</template>

<script setup>
import { computed, ref, reactive } from "vue";
import useMember from "components/Member/MemberData"
import { chatAPI } from "boot/axios"
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { httpsCallable } from "firebase/functions";
import {FirebaseFunctions} from "boot/firebase";

const memberID = ref("")
const mobile= ref("")
const displayOptions = ref({})
const searchCriteria = ref({})
const inputText = ref()
const answer = ref()
// const { members, loadMember } = useMember(searchCriteria, displayOptions)
const backgroundKnowledge = `
青年籃球組(2022-2023)
日期: 2022年5月16日 - 2023年3月31日
時間: 8:00:00 PM - 10:00:00 PM
逢星期一、三
地點: 星有利球場,南蛇塘體育館, 長洲公園籃球場
對象: 12-24歲青少年
名額: 20
`
const info = ref([])

const { onResult } = useQuery(gql`
query getAllInfo {
  HTX_News {
    NewsContent
    NewsContentEN
    NewsRemark
    NewsRemarkEN
    NewsTitle
    NewsTitleEN
    UpdateTime
    NewsSort
    NewsID
  }
  HTX_Article {
    ArticleContent
    ArticleContent2
    ArticleContentEN
    ArticleContentEN2
    ArticleName
    BannerPic
    UpdateTime
    ArticleID
  }
  HTX_About_Article {
    AboutClassID
    ArticleContent
    ArticleContent2
    ArticleContentEN
    ArticleContentEN2
    ArticleTitle
    BannerPic
    UpdateTime
    ArticleID
  }
}`)

onResult((result) => {
  // console.log("result:" + JSON.stringify(result))
  let newsInfo = []
  result.data.HTX_News.forEach((item) => {
    newsInfo.push({
      UpdateTime: item.UpdateTime,
      NewsTitle: item.NewsTitle,
      NewsTitleEN: item.NewsTitleEN,
      NewsRemark: item.NewsRemark? item.NewsRemark.replace(/[\r\n\t]/g, "").replace(/<\/?[^>]+(>|$)/g, ""): "",
      NewsRemarkEN: item.NewsRemarkEN? item.NewsRemarkEN.replace(/[\r\n\t]/g, "").replace(/<\/?[^>]+(>|$)/g, ""): "",
      NewsContent: item.NewsContent? item.NewsContent.replace(/[\r\n\t]/g, "").replace(/<\/?[^>]+(>|$)/g, ""): "",
      NewsContentEN: item.NewsContentEN? item.NewsContentEN.replace(/[\r\n\t]/g, "").replace(/<\/?[^>]+(>|$)/g, ""): "",
    })
  })
  chatAPI.post("https://api.openai.com/v1/completions", {
      "model": "text-davinci-003",
      "prompt": JSON.stringify(newsInfo),
      "max_tokens": 200,
      "temperature": 0,
      "top_p": 1,
      "n": 1,
      "stream": false,
    }).then((result) => {
      console.log("ai news result:" + JSON.stringify(result))
    })
  console.log("news:" + JSON.stringify(newsInfo))
  let articleInfo = []
  result.data.HTX_Article.forEach((item) => {
    articleInfo.push({
      UpdateTime: item.UpdateTime,
      ArticleContent: item.ArticleContent? item.ArticleContent.replace(/[\r\n\t]/g, "").replace(/<\/?[^>]+(>|$)/g, ""): "",
      ArticleContentEN: item.ArticleContentEN? item.ArticleContentEN.replace(/[\r\n\t]/g, "").replace(/<\/?[^>]+(>|$)/g, ""): "",
      ArticleName: item.ArticleName,
    })
  })
  
  chatAPI.post("https://api.openai.com/v1/completions", {
      "model": "text-davinci-003",
      "prompt": JSON.stringify(articleInfo),
      "max_tokens": 200,
      "temperature": 0,
      "top_p": 1,
      "n": 1,
      "stream": false,
    })
  console.log("articles:" + JSON.stringify(articleInfo))
  let aboutArticleInfo = []
  result.data.HTX_About_Article.forEach((item) => {
    aboutArticleInfo.push({     
      UpdateTime: item.UpdateTime,
      ArticleContent: item.ArticleContent? item.ArticleContent.replace(/[\r\n\t]/g, "").replace(/<\/?[^>]+(>|$)/g, ""): "",
      ArticleContentEN: item.ArticleContentEN? item.ArticleContentEN.replace(/[\r\n\t]/g, "").replace(/<\/?[^>]+(>|$)/g, ""): "",
      ArticleTitle: item.ArticleTitle,
    })
  })
  
  chatAPI.post("https://api.openai.com/v1/completions", {
      //"model": "gpt-3.5-turbo",
      "model": "text-davinci-003",
      "prompt": JSON.stringify(aboutArticleInfo),
      "max_tokens": 200,
      "temperature": 0,
      "top_p": 1,
      "n": 1,
      "stream": false,
    })
  console.log("aboutArticles:" + JSON.stringify(aboutArticleInfo))
})

function chat() {
  console.log("info:" + info.value)
  try {
    chatAPI.post("https://api.openai.com/v1/completions", {
      //"model": "gpt-3.5-turbo",
      "model": "text-davinci-003",
      /* "messages": [
        { 
          "role": "user",
          "content": inputText.value,
        }
      ],*/
      "prompt": inputText.value,
      "max_tokens": 200,
      "temperature": 0,
      "top_p": 1,
      "n": 1,
      "stream": false,
    }).then((res) => {
      // console.log(JSON.stringify(res))
      // console.log(res.data.choices[0].message.content.trim())
      //answer.value = res.data.choices[0].message.content.trim()
      answer.value = res.data.choices[0].text.trim()
    })
  } catch (error) {
    console.error(error)
  }
}




// computed
// const memberData = computed(() => members.value? members.value: [])

async function search() {
  if (memberID.value) {
    searchCriteria.value.c_mem_id = {
      compare: "_eq",
      value: memberID.value
    } 
  } else delete searchCriteria.value.c_mem_id
  
  if (mobile.value) {
    searchCriteria.value.c_tel = {
      compare: "_like",
      value: "%"+mobile.value+"%"
    }
  } else delete searchCriteria.value.c_tel

  // await loadMember()
}

async function upload() {
  const upload = httpsCallable(FirebaseFunctions,
    "file-saveFileToStorage"
  );
  upload()
    .then((result) => {
      console.log(JSON.stringify(result));
    })
    .catch((err) => {
      console.err(JSON.stringify(err));
    });
}
</script>