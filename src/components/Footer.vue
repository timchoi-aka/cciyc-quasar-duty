<template>
  <q-page>
    <div>
      <table>
        <tbody>
          <tr>
            <th class="caption"></th>
            <th class="content">
              <div>中心服務時間：</div>
              <div>
                <span class="mx-3">星期一至五：2PM-10PM</span>
                <span class="mx-3">星期六：2PM-6PM</span>
                <span class="mx-3">星期日休息</span>
              </div>
            </th>
          </tr>
          <tr>
            <th class="caption">備註</th>
            <th class="content">
              <span class="q-mx-sm">AL 年假</span>
              <span class="q-mx-sm">M 開會</span>
              <span class="q-mx-sm">O 外出工作</span>
              <span class="q-mx-sm">(補) 補OT</span>
              <span class="q-mx-sm">SL 病假</span>
              <span class="q-mx-sm">(覆)覆診</span>
              <span v-if="numberOfHoliday > 0">
                <q-icon name="report_problem" size="lg" color="negative" />{{
                  numberOfHoliday
                }}日公眾假期返{{ numberOfWorkingSessions }}節
              </span>
            </th>
          </tr>
        </tbody>
      </table>
    </div>
  </q-page>
</template>

<script>
import holiday from "assets/holiday.json";
import date from "src/lib/date.js"

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
  methods: {
    generateTableColumns() {
      // build column headers
      // find offset to sunday
      var diff = 0 - this.renderDate.getDay();

      // set the weekStart and weekEnd date
      const day1 = new Date(
        this.renderDate.getFullYear(),
        this.renderDate.getMonth(),
        this.renderDate.getDate() + diff,
        0,
        0,
        0
      );
      this.queryStartDate = day1;

      const slot = ["slot_a", "slot_b", "slot_c"];

      // fill up this week's dates
      for (let j = 0; j < 3; j++) {
        this.columns.push({
          name: this.mergeDateSlot(day1, slot[j]),
          label: this.mergeDateSlot(day1, slot[j]),
          field: this.mergeDateSlot(day1, slot[j]),
        });
      }

      for (let i = 1; i < 7; i++) {
        let day = new Date(
          day1.getFullYear(),
          day1.getMonth(),
          day1.getDate() + i,
          0,
          0,
          0
        );

        if (i == 6) day.setTime(day.getTime() + 82800000 + 3540000 + 59000); // adjust last date to 23:59:59
        this.queryEndDate = day;

        for (let j = 0; j < 3; j++) {
          this.columns.push({
            name: this.mergeDateSlot(day, slot[j]),
            label: this.mergeDateSlot(day, slot[j]),
            field: this.mergeDateSlot(day, slot[j]),
          })
        }
      }
    },
  },
  mounted() {
    this.generateTableColumns()
  },
  created() {
    this.daysOfWeek = date.daysOfWeek.bind(this);
    this.formatDate = date.formatDate.bind(this);
    this.mergeDateSlot = date.mergeDateSlot.bind(this);
    this.splitDateSlot = date.splitDateSlot.bind(this);
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
          (element) => element.date == this.formatDate(date, "", "YYYYMMDD")
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

<style scoped>
@media screen {
  .table {
    border: 1px solid black !important;
  }
  .isHoliday {
    background-color: #e07264 !important;
  }
  .table-bordered {
    border: 1px solid black;
  }

  .table-bordered th {
    border: 1px solid black;
  }

  .table-bordered td {
    border: 1px solid black;
  }

  .caption {
    width: 9% !important;
  }

  .content {
    width: 91% !important;
  }
}

@media print {
  .table {
    table-layout: fixed !important;
  }

  .table .caption {
    width: 42px !important;
  }

  .table .content {
    width: 525px !important;
  }

  .table th {
    background-color: lightgray !important;
    border: 1px solid black !important;
    overflow: hidden !important;
  }
}
</style>
