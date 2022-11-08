<template>
<q-table
  :rows="logdata"
  :columns="columns"
  wrap-cells
  
/>

</template>

<script>
import { gql } from "graphql-tag"

export default {
  name: "LogViewer",
  async mounted() {
    this.$apollo.query({
      query: gql`
        query getLog {
          Log(order_by: {datetime: desc}) {
            action
            datetime
            module
            username
          }
        }`,
    }).then((data) => {
      /*
      const result = data.data.Log
      result.forEach((d) => {
        this.logdata.push({
          action: d.action
        })
      })
      */
     this.logdata = data.data.Log;
    })
  },
  data() {
    return {
      logdata: [],
      columns: [
        {
          name: "datetime",
          label: "日期",
          field: "datetime",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
          headerClasses: "bg-grey-2",
        },
        {
          name: "module",
          label: "模組",
          field: "module",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
          headerClasses: "bg-grey-2",
        },
        {
          name: "username",
          label: "使用者",
          field: "username",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
          headerClasses: "bg-grey-2",
        },
        {
          name: "action",
          label: "動作",
          field: "action",
          style: "font-size: 1vw; text-align: left;",
          headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
          headerClasses: "bg-grey-2",
        },
      ]
    }
  }
}
</script>