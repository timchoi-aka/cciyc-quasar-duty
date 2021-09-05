<template>
  <table>
    <tbody>
      <tr>
        <th class="caption" rowspan="2">備註</th>
        <th class="content">
          <div>中心服務時間：</div>
          <div>
            <span class="q-mx-md">星期一至五：2PM-10PM</span>
            <span class="q-mx-md">星期六：2PM-6PM</span>
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
          <span v-if="numberOfHoliday > 0">
            <q-icon name="report_problem" size="lg" color="negative" />{{
              numberOfHoliday
            }}日公眾假期返{{ numberOfWorkingSessions }}節
          </span>
        </th>
      </tr>
    </tbody>
  </table>
</template>

<script>
import holiday from "assets/holiday.json";
import date from "src/lib/date.js";
import dateHeader from "src/lib/dateHeader.js";
import { useQuasar } from "quasar";

export default {
  name: "Footer",
  props: {
    renderDate: Date,
  },
  data() {
    return {
      columns: [],
    };
  },
  mounted() {
    this.columns.push(...this.generateTableColumns(this.renderDate, false));
  },
  created() {
    this.formatDate = date.formatDate.bind(this);
    this.generateTableColumns = dateHeader.generateTableColumns.bind(this);
  },
  setup() {
    const $q = useQuasar();
  },
  computed: {
    publicHoliday: function () {
      var ph = [];
      holiday.vcalendar[0].vevent.forEach((record) => {
        ph.push({
          date: record.dtstart[0],
          summary: record.summary,
        });
      });
      return ph;
    },
    numberOfHoliday: function () {
      var result = 0;
      this.columns.forEach((date) => {
        let i = this.publicHoliday.findIndex(
          (element) => element.date == this.formatDate(date.name, "", "YYYYMMDD")
        );
        if (i != -1) result++;
      });
      return result;
    },
    numberOfWorkingSessions: function () {
      return 11 - 2 * this.numberOfHoliday;
    },
  },
};
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

@media screen {
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
  }

  table .content span {
    margin-right: 2vw;
  }
}

@media print {
  table .caption {
    width: 9vw !important;
    padding: 0 !important;
    vertical-align: top;
    text-align: center;
    border: 0.5px solid black;
  }

  table .content {
    padding: 5px !important;
    width: 88.2vw;
  }

  table .content span {
    margin-right: 2vw;
  }

  table th {
    background-color: lightgray !important;
    border: 1px solid black !important;
    overflow: hidden !important;
  }
}

@media print and (orientation: portrait) {
  table {
    width: 84vw;
  }
}

@media print and (orientation: landscape) {
  table {
    width: 97.2vw;
  }
}
</style>
