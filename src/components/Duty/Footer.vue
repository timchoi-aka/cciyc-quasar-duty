<template>
  <q-markup-table flat square>
    <tbody>
      <tr>
        <th class="caption" rowspan="2">備註</th>
        <th class="content">
          <div>中心服務時間：</div>
          <div v-if="renderDate < new Date('2023-05-22T00:00:00')">
            <span class="q-mx-md">星期一至五：2PM-10PM</span>
            <span class="q-mx-md">星期六：2PM-6PM</span>
            <span class="q-mx-md">星期日休息</span>
          </div>
          <div v-else>
            <span class="q-mx-md">星期一、三：6PM-10PM</span>
            <span class="q-mx-md">星期二、四、五：2PM-6PM</span>
            <span class="q-mx-md">星期六：10AM-10PM</span>
            <span class="q-mx-md">星期日休息</span>
          </div>
        </th>
      </tr>
      <tr>
        <th class="content">
          <span class="q-mx-md">AL 年假</span>
          <span class="q-mx-md">M 開會</span>
          <span class="q-mx-md">O 外出工作</span>
          <span class="q-mx-md">(補) 補OT</span>
          <span class="q-mx-md">SL 病假</span>
          <span class="q-mx-md">(覆)覆診</span>
          <span class="q-mx-md">(長)長週</span>
          <span class="q-mx-md">(短)短週</span>
          <span v-if="numberOfHoliday > 0">
            <q-icon name="report_problem" :size="$q.screen.gt.sm? 'lg': 'sm'" color="negative" />{{
              numberOfHoliday
            }}日公眾假期返{{ numberOfWorkingSessions }}節
          </span>
        </th>
      </tr>
    </tbody>
  </q-markup-table>
</template>

<script setup>
import holiday from "assets/holiday.json";
import dateUtil from "src/lib/date.js";
import { useQuasar, date as qdate } from "quasar";
import { computed } from "vue"

// props
const props = defineProps({
  renderDate: Date
})

// variables
const $q = useQuasar();

// computed
const columns = computed(() => [...dateUtil.generateTableColumns(props.renderDate)])
const publicHoliday = computed(() => holiday? holiday.vcalendar[0].vevent.map(({dtstart, summary}) => ({date: dtstart[0], summary: summary})): [])


const numberOfHoliday = computed(() => {
  var result = 0;
  if (columns.value) {
    [...dateUtil.generateTableColumns(props.renderDate, false)].forEach((date) => {
      let i = publicHoliday.value.findIndex(
        (element) => element.date == qdate.formatDate(date.name, "YYYYMMDD")
      );
      if (i != -1) result++
    })
    return result
  } else return 0
})
const numberOfWorkingSessions = computed(() => 11 - 2 * numberOfHoliday.value)
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
}

table {
  border: 0.5px solid black;
  border-collapse: collapse;
}

table th,
td {
  font-weight: bold;
  font-size: 1.3vw;
  text-align: left;
  vertical-align: top;
}

@media screen and (min-width: 600px) {
  table {
    width: 97.2vw;
    background-color: lightgray;
  }

  table .caption {
    width: 9vw;
    padding: 0 !important;
    vertical-align: top;
    text-align: center;
    border: 0.5px solid black;
  }

  table .content {
    padding: 5px !important;
    width: 88.2vw;
    border: 0.5px solid black;
  }

  table .content span {
    margin-right: 2vw;
  }
}

@media screen and (max-width: 600px) {
  table {
    width: 97.2vw;
    background-color: lightgray;
  }

  table .caption {
    width: 9vw;
    padding: 0 !important;
    vertical-align: top;
    text-align: center;
    border: 0.5px solid black;
    font-size: 3vw;
  }

  table .content {
    padding: 5px !important;
    width: 88.2vw;
    border: 0.5px solid black;
    font-size: 3vw;
    display: flex;
    flex-wrap: wrap;
  }

  table .content span {
    margin-right: 2vw;
  }
}

@media print and (orientation: landscape) {
  @page {
    size: A4 landscape;
  }

  .q-markup-table {
    border: 0.5px solid black !important;
  }
  table .caption {
    width: 9vw !important;
    padding: 0 !important;
    vertical-align: top;
    text-align: center;
    border-right: 0.5px solid black;
  }

  table .content {
    padding: 5px !important;
    width: 88.2vw;
    min-width: 88.2vw;
    max-width: 88.2vw;
    // border: 0.5px solid black;
  }

  table .content span {
    margin-right: 2vw;
  }

  table th {
    background-color: lightgray !important;
    // border: 0.5px solid black !important;
    overflow: hidden !important;
  }
}

@media print and (orientation: portrait) {
  @page {
    size: A4 portrait;
  }
  .q-markup-table {
    border: 0.5px solid black !important;
  }
  table .caption {
    width: 9vw;
    min-width: 9vw;
    max-width: 9vw;
    //padding: 0 !important;
    vertical-align: top;
    text-align: center;
    border-right: 0.5px solid black;
  }

  table .content {
    padding: 5px !important;
    width: 62vw;
    //border-left: 0.5px solid black;
    //border-right: 0.5px solid black;
  }

  table .content span {
    margin-right: 2vw;
  }

  table th {
    background-color: lightgray !important;
    // border: 0.5px solid black !important;
    overflow: hidden !important;
  }
}
</style>
