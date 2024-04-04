<template>
  <!-- loading dialog -->
  <LoadingDialog :model-value="loading ? 1 : 0" message="處理中" />

  <!-- rowDetail modal -->
  <q-dialog
    v-if="$q.screen.lt.md"
    v-model="detailModal"
    persistent
    maximized
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <Receipt :c_receipt_no="showReceiptNo" />
  </q-dialog>

  <q-dialog
    v-else
    v-model="detailModal"
    persistent
    full-height
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
  >
    <q-card style="min-width: 70vw; width: 70vw; max-width: 70vw">
      <Receipt :c_receipt_no="showReceiptNo" />
    </q-card>
  </q-dialog>

  <!-- Event Detail modal -->
  <q-dialog
    v-if="$q.screen.lt.md"
    v-model="EventDetailModal"
    persistent
    maximized
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <EventDetail
      :EventID="showEventID"
      @hide-component="EventDetailModal = false"
    />
  </q-dialog>

  <q-dialog
    v-else
    v-model="EventDetailModal"
    persistent
    full-width
    full-height
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
  >
    <EventDetail :EventID="showEventID" />
  </q-dialog>

  <!-- date range selector -->
  <div class="row justify-center" style="margin-top: 70px">
    <div class="row q-mb-sm justify-center items-center">
      <div class="col-2 q-mx-md">
        <DateComponent v-model="reportStartDate" label="開始日期" />
      </div>
      <div class="col-2 q-mx-md">
        <DateComponent v-model="reportEndDate" label="結束日期" />
      </div>
      <div class="col-2 q-mx-md"><EventSelection v-model="reportEvent" /></div>
      <div class="col-2 q-mx-md">
        <StaffSelection :multiple="false" v-model="reportStaff" />
      </div>
      <div class="col-1 q-mx-md">
        <q-btn
          icon="undo"
          label="重置"
          class="bg-primary text-white"
          @click="reset"
        />
      </div>
    </div>
  </div>

  <q-tabs
    v-model="activeTab"
    inline-label
    align="left"
    class="desktop-only bg-primary text-white"
  >
    <q-tab name="accountReport" icon="source" label="會計報表" />
    <q-tab
      name="All"
      icon="source"
      :label="'收據細列表(' + ReceiptData.length + ')'"
    />
    <!--
    <q-tab name="Error" icon="error" :label="'錯誤('+ErrorData.length+'人)'" />
    -->
    <q-tab
      name="delete"
      icon="source"
      :label="'刪除收據細列表(' + DeletedData.length + ')'"
    />
    <q-tab name="dailyIncome" icon="source" label="每日收費摘要" />
  </q-tabs>

  <q-tab-panels
    id="printMe"
    v-model="activeTab"
    animated
    swipeable
    transition-prev="jump-up"
    transition-next="jump-up"
  >
    <q-tab-panel name="All" class="q-ma-none q-pa-sm">
      <div class="col-12 row items-center hideOnScreen">
        <img
          src="~assets/cciyc_logo.svg"
          style="width: 90px; height: 90px"
          class="col-1"
        />
        <div class="print-title col-7 row q-mx-md items-center">
          <div class="col-12">長洲鄉事委員會青年綜合服務中心</div>
          <div class="col-12">
            Cheung Chau Rural Committee Integrated Youth Centre
          </div>
        </div>
      </div>
      <div class="col-12 row hideOnScreen justify-around q-py-none q-my-none">
        <div class="col-auto q-mx-md items-end">
          範圍：{{ reportStartDate }} - {{ reportEndDate }}
        </div>
        <div v-if="reportEvent" class="col-auto q-mx-md items-end">
          活動編號：{{ reportEvent }}
        </div>
        <div v-if="reportStaff" class="col-auto q-mx-md items-end">
          負責人：{{ reportStaff.label }}
        </div>
      </div>
      <div
        class="col-12 row hideOnScreen justify-end items-end q-py-none q-my-none"
      >
        列印日期：{{ qdate.formatDate(new Date(), "YYYY年M月D日") }}
      </div>
      <!-- 收據細列表 -->
      <q-table
        dense
        flat
        :rows="ReceiptData"
        :columns="receiptListColumns"
        :pagination="defaultPagination"
        hide-pagination
        :rows-per-page-options="[0]"
        color="primary"
        row-key="c_receipt_no"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <!-- loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <!-- status -->
        <template v-slot:body-cell-c_status="props">
          <q-td :props="props">
            <div v-if="props.row.b_refund">退款</div>
            <div v-if="props.row.b_delete">刪除</div>
          </q-td>
        </template>

        <!-- top -->
        <template v-slot:top class="row">
          <div
            class="q-my-none q-py-none row col-12 items-end"
            style="line-height: 10px"
          >
            <div class="col-auto items-end text-bold">收據細列表</div>
            <q-space />

            <q-btn
              icon="print"
              flat
              class="bg-primary text-white col-shrink q-mx-md hideOnPrint items-end"
              v-print="printObj"
            >
              <q-tooltip class="bg-white text-primary">列印</q-tooltip>
            </q-btn>
            <q-btn
              color="primary"
              icon-right="archive"
              class="hideOnPrint"
              label="匯出Excel"
              no-caps
              @click="
                exportExcel(
                  ReceiptData,
                  receiptListColumns,
                  '收據細列表' + reportStartDate + '-' + reportEndDate
                )
              "
            />
          </div>
        </template>

        <!-- bottom total row -->
        <template v-slot:bottom-row="props">
          <q-tr>
            <q-td
              v-for="index in props.cols.length"
              class="text-center"
              style="line-height: 10px"
            >
              {{
                props.cols[index - 1].name == "u_price_after_discount"
                  ? "總金額(HKD): "
                  : ""
              }}
              {{
                ReceiptData.reduce(
                  (x, v) =>
                    props.cols[index - 1].name == "u_price_after_discount"
                      ? x + v[props.cols[index - 1].name]
                      : "",
                  0
                ).toLocaleString()
              }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="dailyIncome" class="q-ma-none q-pa-md">
      <DailyIncomeReport :accounts="ReceiptData" />
    </q-tab-panel>

    <q-tab-panel name="delete" class="q-ma-none q-pa-md">
      <div class="col-12 row items-center hideOnScreen">
        <img
          src="~assets/cciyc_logo.svg"
          style="width: 90px; height: 90px"
          class="col-1"
        />
        <div class="print-title col-7 row q-mx-md items-center">
          <div class="col-12">長洲鄉事委員會青年綜合服務中心</div>
          <div class="col-12">
            Cheung Chau Rural Committee Integrated Youth Centre
          </div>
        </div>
      </div>
      <div class="col-12 row hideOnScreen justify-around q-py-none q-my-none">
        <div class="col-auto q-mx-md items-end">
          範圍：{{ reportStartDate }} - {{ reportEndDate }}
        </div>
        <div v-if="reportEvent" class="col-auto q-mx-md items-end">
          活動編號：{{ reportEvent }}
        </div>
        <div v-if="reportStaff" class="col-auto q-mx-md items-end">
          負責人：{{ reportStaff.label }}
        </div>
      </div>
      <div
        class="col-12 row hideOnScreen justify-end items-end q-py-none q-my-none"
      >
        列印日期：{{ qdate.formatDate(new Date(), "YYYY年M月D日") }}
      </div>
      <!-- 刪除收據 -->
      <q-table
        dense
        flat
        :rows="DeletedData"
        :columns="receiptListColumns"
        :pagination="defaultPagination"
        hide-pagination
        :rows-per-page-options="[0]"
        color="primary"
        row-key="c_receipt_no"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <!-- loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <!-- top -->
        <template v-slot:top class="row">
          <div
            class="q-my-none q-py-none row col-12 items-end"
            style="line-height: 10px"
          >
            <div class="col-auto items-end text-bold">刪除收據細列表</div>
            <q-space />
            <q-btn
              icon="print"
              flat
              class="bg-primary text-white col-shrink q-mx-md hideOnPrint items-end"
              v-print="printObj"
            >
              <q-tooltip class="bg-white text-primary">列印</q-tooltip>
            </q-btn>
            <q-btn
              color="primary"
              class="hideOnPrint"
              icon-right="archive"
              label="匯出Excel"
              no-caps
              @click="
                exportExcel(
                  DeletedData,
                  receiptListColumns,
                  '刪除收據細列表' + reportStartDate + '-' + reportEndDate
                )
              "
            />
          </div>
        </template>

        <!-- bottom total row -->
        <template v-slot:bottom-row="props">
          <q-tr>
            <q-td
              v-for="index in props.cols.length"
              class="text-center"
              style="line-height: 10px"
            >
              {{
                props.cols[index - 1].name == "u_price_after_discount"
                  ? "總金額(HKD): "
                  : ""
              }}
              {{
                DeletedData.reduce(
                  (x, v) =>
                    props.cols[index - 1].name == "u_price_after_discount"
                      ? x + v[props.cols[index - 1].name]
                      : "",
                  0
                ).toLocaleString()
              }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-tab-panel>

    <!-- 會計報表 -->
    <q-tab-panel name="accountReport" class="q-ma-none q-pa-sm">
      <div class="col-12 row items-center hideOnScreen">
        <img
          src="~assets/cciyc_logo.svg"
          style="width: 90px; height: 90px"
          class="col-1"
        />
        <div class="print-title col-7 row q-mx-md items-center">
          <div class="col-12">長洲鄉事委員會青年綜合服務中心</div>
          <div class="col-12">
            Cheung Chau Rural Committee Integrated Youth Centre
          </div>
        </div>
      </div>
      <div class="col-12 row hideOnScreen justify-around q-py-none q-my-none">
        <div class="col-auto q-mx-md items-end">
          範圍：{{ reportStartDate }} - {{ reportEndDate }}
        </div>
        <div v-if="reportEvent" class="col-auto q-mx-md items-end">
          活動編號：{{ reportEvent }}
        </div>
        <div v-if="reportStaff" class="col-auto q-mx-md items-end">
          負責人：{{ reportStaff.label }}
        </div>
      </div>
      <div
        class="col-12 row hideOnScreen justify-end items-end q-py-none q-my-none"
      >
        列印日期：{{ qdate.formatDate(new Date(), "YYYY年M月D日") }}
      </div>
      <!-- PF -->
      <q-table
        v-if="PFData.length > 0"
        dense
        flat
        :rows="PFData"
        :columns="accountReportColumns"
        :pagination="accountReportPagination"
        hide-pagination
        :rows-per-page-options="[0]"
        color="primary"
        class="q-mt-md"
        :loading="loading"
        binary-state-sort
        no-data-label="沒有資料"
        @row-click="eventDetail"
      >
        <!-- loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <!-- status -->
        <template v-slot:body-cell-c_status="props">
          <q-td :props="props">
            <div v-if="props.row.b_refund">退款</div>
            <div v-if="props.row.b_delete">刪除</div>
          </q-td>
        </template>

        <!-- top -->
        <template v-slot:top>
          <div class="q-my-none q-py-none row col-12 items-end">
            <div class="col-auto items-end text-bold">會計報表(PF)</div>
            <q-space />
            <q-btn
              icon="print"
              flat
              class="bg-primary text-white col-shrink q-mx-md hideOnPrint items-end"
              v-print="printObj"
            >
              <q-tooltip class="bg-white text-primary">列印</q-tooltip>
            </q-btn>
            <q-btn
              color="primary"
              class="hideOnPrint items-end"
              icon-right="archive"
              label="匯出Excel"
              no-caps
              @click="
                exportExcel(
                  PFData,
                  accountReportColumns,
                  '會計報表(PF)-' + reportStartDate + '-' + reportEndDate
                )
              "
            />
          </div>
        </template>

        <!-- bottom total row -->
        <template v-slot:bottom-row="props">
          <q-tr>
            <q-td
              v-for="index in props.cols.length"
              class="text-center"
              style="line-height: 10px"
            >
              {{ props.cols[index - 1].name == "number" ? "總數: " : "" }}
              {{
                props.cols[index - 1].name == "number"
                  ? PFData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    )
                  : ""
              }}
              {{
                props.cols[index - 1].name == "total" ? "PF-總金額(HKD): " : ""
              }}
              {{
                props.cols[index - 1].name == "total"
                  ? PFData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    ).toLocaleString()
                  : ""
              }}
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <!-- MF -->
      <q-table
        v-if="MFData.length > 0"
        dense
        flat
        :rows="MFData"
        :columns="accountReportColumns"
        :pagination="accountReportPagination"
        color="primary"
        class="q-mt-md"
        :loading="loading"
        binary-state-sort
        hide-pagination
        :rows-per-page-options="[0]"
        no-data-label="沒有資料"
      >
        <!-- loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <!-- status -->
        <template v-slot:body-cell-c_status="props">
          <q-td :props="props">
            <div v-if="props.row.b_refund">退款</div>
            <div v-if="props.row.b_delete">刪除</div>
          </q-td>
        </template>

        <!-- top -->
        <template v-slot:top>
          <div
            class="q-my-none q-py-none row col-12 items-end"
            style="line-height: 10px"
          >
            <div class="col-auto items-end text-bold">會計報表(MF)</div>
            <q-space />
            <q-btn
              icon="print"
              flat
              class="bg-primary text-white col-shrink q-mx-md hideOnPrint items-end"
              v-print="printObj"
            >
              <q-tooltip class="bg-white text-primary">列印</q-tooltip>
            </q-btn>
            <q-btn
              color="primary"
              class="hideOnPrint"
              icon-right="archive"
              label="匯出Excel"
              no-caps
              @click="
                exportExcel(
                  MFData,
                  accountReportColumns,
                  '會計報表(MF)-' + reportStartDate + '-' + reportEndDate
                )
              "
            />
          </div>
        </template>

        <!-- bottom total row -->
        <template v-slot:bottom-row="props">
          <q-tr>
            <q-td
              v-for="index in props.cols.length"
              class="text-center"
              style="line-height: 10px"
            >
              {{ props.cols[index - 1].name == "number" ? "總數: " : "" }}
              {{
                props.cols[index - 1].name == "number"
                  ? MFData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    )
                  : ""
              }}
              {{
                props.cols[index - 1].name == "total" ? "MF-總金額(HKD): " : ""
              }}
              {{
                props.cols[index - 1].name == "total"
                  ? MFData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    ).toLocaleString()
                  : ""
              }}
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <!-- SF -->
      <q-table
        v-if="SFData.length > 0"
        dense
        flat
        :rows="SFData"
        :columns="accountReportColumns"
        :pagination="accountReportPagination"
        color="primary"
        class="q-mt-md"
        :loading="loading"
        binary-state-sort
        hide-pagination
        :rows-per-page-options="[0]"
        no-data-label="沒有資料"
        @row-click="eventDetail"
      >
        <!-- loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <!-- status -->
        <template v-slot:body-cell-c_status="props">
          <q-td :props="props">
            <div v-if="props.row.b_refund">退款</div>
            <div v-if="props.row.b_delete">刪除</div>
          </q-td>
        </template>

        <!-- top -->
        <template v-slot:top>
          <div
            class="q-my-none q-py-none row col-12 items-end"
            style="line-height: 10px"
          >
            <div class="col-auto items-end text-bold">會計報表(SF)</div>
            <q-space />
            <q-btn
              icon="print"
              flat
              class="bg-primary text-white col-shrink q-mx-md hideOnPrint items-end"
              v-print="printObj"
            >
              <q-tooltip class="bg-white text-primary">列印</q-tooltip>
            </q-btn>
            <q-btn
              color="primary"
              class="hideOnPrint"
              icon-right="archive"
              label="匯出Excel"
              no-caps
              @click="
                exportExcel(
                  SFData,
                  accountReportColumns,
                  '會計報表(SF)-' + reportStartDate + '-' + reportEndDate
                )
              "
            />
          </div>
        </template>

        <!-- bottom total row -->
        <template v-slot:bottom-row="props">
          <q-tr>
            <q-td
              v-for="index in props.cols.length"
              class="text-center"
              style="line-height: 10px"
            >
              {{ props.cols[index - 1].name == "number" ? "總數: " : "" }}
              {{
                props.cols[index - 1].name == "number"
                  ? SFData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    )
                  : ""
              }}
              {{
                props.cols[index - 1].name == "total" ? "SF-總金額(HKD): " : ""
              }}
              {{
                props.cols[index - 1].name == "total"
                  ? SFData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    ).toLocaleString()
                  : ""
              }}
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <!-- RF -->
      <q-table
        v-if="RFData.length > 0"
        dense
        flat
        :rows="RFData"
        :columns="accountReportColumns"
        :pagination="accountReportPagination"
        color="primary"
        class="q-mt-md"
        :loading="loading"
        binary-state-sort
        hide-pagination
        :rows-per-page-options="[0]"
        no-data-label="沒有資料"
      >
        <!-- loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <!-- status -->
        <template v-slot:body-cell-c_status="props">
          <q-td :props="props">
            <div v-if="props.row.b_refund">退款</div>
            <div v-if="props.row.b_delete">刪除</div>
          </q-td>
        </template>

        <!-- top -->
        <template v-slot:top>
          <div
            class="q-my-none q-py-none row col-12 items-end"
            style="line-height: 10px"
          >
            <div class="col-auto items-end text-bold">會計報表(RF)</div>
            <q-space />
            <q-btn
              icon="print"
              flat
              class="bg-primary text-white col-shrink q-mx-md hideOnPrint items-end"
              v-print="printObj"
            >
              <q-tooltip class="bg-white text-primary">列印</q-tooltip>
            </q-btn>
            <q-btn
              color="primary"
              class="hideOnPrint"
              icon-right="archive"
              label="匯出Excel"
              no-caps
              @click="
                exportExcel(
                  RFData,
                  accountReportColumns,
                  '會計報表(RF)-' + reportStartDate + '-' + reportEndDate
                )
              "
            />
          </div>
        </template>

        <!-- bottom total row -->
        <template v-slot:bottom-row="props">
          <q-tr>
            <q-td
              v-for="index in props.cols.length"
              class="text-center"
              style="line-height: 10px"
            >
              {{ props.cols[index - 1].name == "number" ? "總數: " : "" }}
              {{
                props.cols[index - 1].name == "number"
                  ? RFData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    )
                  : ""
              }}
              {{
                props.cols[index - 1].name == "total" ? "RF-總金額(HKD): " : ""
              }}
              {{
                props.cols[index - 1].name == "total"
                  ? RFData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    ).toLocaleString()
                  : ""
              }}
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <!-- CF -->
      <q-table
        v-if="CFData.length > 0"
        dense
        flat
        :rows="CFData"
        :columns="accountReportColumns"
        :pagination="accountReportPagination"
        color="primary"
        class="q-mt-md"
        :loading="loading"
        binary-state-sort
        hide-pagination
        :rows-per-page-options="[0]"
        no-data-label="沒有資料"
      >
        <!-- loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <!-- status -->
        <template v-slot:body-cell-c_status="props">
          <q-td :props="props">
            <div v-if="props.row.b_refund">退款</div>
            <div v-if="props.row.b_delete">刪除</div>
          </q-td>
        </template>

        <!-- top -->
        <template v-slot:top>
          <div
            class="q-my-none q-py-none row col-12 items-end"
            style="line-height: 10px"
          >
            <div class="col-auto items-end text-bold">會計報表(CF)</div>
            <q-space />
            <q-btn
              icon="print"
              flat
              class="bg-primary text-white col-shrink q-mx-md hideOnPrint items-end"
              v-print="printObj"
            >
              <q-tooltip class="bg-white text-primary">列印</q-tooltip>
            </q-btn>
            <q-btn
              color="primary"
              class="hideOnPrint"
              icon-right="archive"
              label="匯出Excel"
              no-caps
              @click="
                exportExcel(
                  CFData,
                  accountReportColumns,
                  '會計報表(CF)-' + reportStartDate + '-' + reportEndDate
                )
              "
            />
          </div>
        </template>

        <!-- bottom total row -->
        <template v-slot:bottom-row="props">
          <q-tr>
            <q-td
              v-for="index in props.cols.length"
              class="text-center"
              style="line-height: 10px"
            >
              {{ props.cols[index - 1].name == "number" ? "總數: " : "" }}
              {{
                props.cols[index - 1].name == "number"
                  ? CFData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    )
                  : ""
              }}
              {{
                props.cols[index - 1].name == "total" ? "CF-總金額(HKD): " : ""
              }}
              {{
                props.cols[index - 1].name == "total"
                  ? CFData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    ).toLocaleString()
                  : ""
              }}
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <!-- 新會員費 -->
      <q-table
        v-if="NewMemberData.length > 0"
        dense
        flat
        :rows="NewMemberData"
        :columns="accountReportColumns"
        :pagination="accountReportPagination"
        color="primary"
        class="q-mt-md"
        :loading="loading"
        binary-state-sort
        hide-pagination
        :rows-per-page-options="[0]"
        no-data-label="沒有資料"
      >
        <!-- loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <!-- status -->
        <template v-slot:body-cell-c_status="props">
          <q-td :props="props">
            <div v-if="props.row.b_refund">退款</div>
            <div v-if="props.row.b_delete">刪除</div>
          </q-td>
        </template>

        <!-- top -->
        <template v-slot:top>
          <div
            class="q-my-none q-py-none row col-12 items-end"
            style="line-height: 10px"
          >
            <div class="col-auto items-end text-bold">會計報表(新會員費)</div>
            <q-space />
            <q-btn
              icon="print"
              flat
              class="bg-primary text-white col-shrink q-mx-md hideOnPrint items-end"
              v-print="printObj"
            >
              <q-tooltip class="bg-white text-primary">列印</q-tooltip>
            </q-btn>
            <q-btn
              color="primary"
              class="hideOnPrint"
              icon-right="archive"
              label="匯出Excel"
              no-caps
              @click="
                exportExcel(
                  NewMemberData,
                  accountReportColumns,
                  '會計報表(新會員費)-' + reportStartDate + '-' + reportEndDate
                )
              "
            />
          </div>
        </template>

        <!-- bottom total row -->
        <template v-slot:bottom-row="props">
          <q-tr>
            <q-td
              v-for="index in props.cols.length"
              class="text-center"
              style="line-height: 10px"
            >
              {{ props.cols[index - 1].name == "number" ? "總數: " : "" }}
              {{
                props.cols[index - 1].name == "number"
                  ? NewMemberData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    )
                  : ""
              }}
              {{
                props.cols[index - 1].name == "total"
                  ? "新會員費-總金額(HKD): "
                  : ""
              }}
              {{
                props.cols[index - 1].name == "total"
                  ? NewMemberData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    ).toLocaleString()
                  : ""
              }}
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <!-- 續會員費 -->
      <q-table
        v-if="RenewMemberData.length > 0"
        dense
        flat
        :rows="RenewMemberData"
        :columns="accountReportColumns"
        :pagination="accountReportPagination"
        color="primary"
        class="q-mt-md"
        :loading="loading"
        binary-state-sort
        hide-pagination
        :rows-per-page-options="[0]"
        no-data-label="沒有資料"
      >
        <!-- loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <!-- status -->
        <template v-slot:body-cell-c_status="props">
          <q-td :props="props">
            <div v-if="props.row.b_refund">退款</div>
            <div v-if="props.row.b_delete">刪除</div>
          </q-td>
        </template>

        <!-- top -->
        <template v-slot:top>
          <div
            class="q-my-none q-py-none row col-12 items-end"
            style="line-height: 10px"
          >
            <div class="col-auto items-end text-bold">會計報表(續會員費)</div>
            <q-space />
            <q-btn
              icon="print"
              flat
              class="bg-primary text-white col-shrink q-mx-md hideOnPrint items-end"
              v-print="printObj"
            >
              <q-tooltip class="bg-white text-primary">列印</q-tooltip>
            </q-btn>
            <q-btn
              color="primary"
              class="hideOnPrint"
              icon-right="archive"
              label="匯出Excel"
              no-caps
              @click="
                exportExcel(
                  RenewMemberData,
                  accountReportColumns,
                  '會計報表(續會員費)-' + reportStartDate + '-' + reportEndDate
                )
              "
            />
          </div>
        </template>

        <!-- bottom total row -->
        <template v-slot:bottom-row="props">
          <q-tr>
            <q-td
              v-for="index in props.cols.length"
              class="text-center"
              style="line-height: 10px"
            >
              {{ props.cols[index - 1].name == "number" ? "總數: " : "" }}
              {{
                props.cols[index - 1].name == "number"
                  ? RenewMemberData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    )
                  : ""
              }}
              {{
                props.cols[index - 1].name == "total"
                  ? "續會員費-總金額(HKD): "
                  : ""
              }}
              {{
                props.cols[index - 1].name == "total"
                  ? RenewMemberData.reduce(
                      (x, v) => x + v[props.cols[index - 1].name],
                      0
                    ).toLocaleString()
                  : ""
              }}
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <div class="row col-12 q-mt-md items-start">
        <div class="col-5 row">
          <div class="col-2">總計：</div>
          <div class="col-9" style="display: block; border-bottom: 1px solid">
            ${{
              PFData.reduce((a, v) => a + v.total, 0) +
              MFData.reduce((a, v) => a + v.total, 0) +
              SFData.reduce((a, v) => a + v.total, 0) +
              RFData.reduce((a, v) => a + v.total, 0) +
              CFData.reduce((a, v) => a + v.total, 0) +
              NewMemberData.reduce((a, v) => a + v.total, 0) +
              RenewMemberData.reduce((a, v) => a + v.total, 0)
            }}
          </div>
        </div>
        <q-space />
        <div class="col-5 row">
          <div class="col-12 row">
            <div class="col-2">制表：</div>
            <div class="col-9" style="display: block; border-bottom: 1px solid">
              {{ username }}
            </div>
          </div>
          <div class="col-12 row q-mt-lg">
            <div class="col-2">審核：</div>
            <div class="col-9" style="display: block; border-bottom: 1px solid">
              &nbsp;
            </div>
          </div>
        </div>
      </div>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import { computed, ref } from "vue";
import { exportFile, date as qdate } from "quasar";
import { useQuery } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { useStore } from "vuex";
import Receipt from "components/Account/Receipt.vue";
import LoadingDialog from "components/LoadingDialog.vue";
import Excel from "src/lib/exportExcel";
import DateComponent from "src/components/Basic/DateComponent.vue";
import EventDetail from "src/components/Event/EventDetail.vue";
import EventSelection from "src/components/Event/EventSelection.vue";
import StaffSelection from "src/components/Basic/StaffSelection.vue";
import DailyIncomeReport from "src/components/Account/DailyIncomeReport.vue";

// variables
// const reportDate = ref(qdate.formatDate(qdate.endOfDate(qdate.subtractFromDate(Date.now(), {month: 1}), 'month'), "YYYY/MM/DD"))
const reportStartDate = ref(
  qdate.formatDate(qdate.startOfDate(Date.now(), "month"), "YYYY/MM/DD")
);
const reportEndDate = ref(
  qdate.formatDate(qdate.endOfDate(Date.now(), "month"), "YYYY/MM/DD")
);
const reportEvent = ref();
const reportStaff = ref();
const detailModal = ref(false);
const EventDetailModal = ref(false);
const showEventID = ref("");
const showReceiptNo = ref("");
const activeTab = ref("All");
// const typeToggle = ref("PF")
const $store = useStore();

const staffNameMapping = {
  胡麗嫦: "lswu",
  何有永: "ywho",
  陳美雲: "mwchan",
  馮麗嫦: "lsfung",
  黃佩珊: "pswong",
  馬桂儀: "kyma",
  吳學麟: "hlng",
  李文艷: "myli",
};

const receiptTypeOptions = [
  { value: 1, label: "會員" },
  { value: 2, label: "活動" },
  { value: 3, label: "食堂" },
  { value: 4, label: "洗衣" },
  { value: 5, label: "罰款" },
  { value: 6, label: "捐款" },
  { value: 7, label: "雜項" },
  { value: 51, label: "會員退款" },
  { value: 52, label: "活動退款" },
  { value: 53, label: "食堂退款" },
  { value: 54, label: "洗衣退款" },
  { value: 55, label: "罰款退款" },
  { value: 56, label: "捐款退款" },
  { value: 57, label: "雜項退款" },
];

const defaultPagination = ref({
  rowsPerPage: 0,
  sortBy: "c_receipt_no",
});

const accountReportPagination = ref({
  rowsPerPage: 0,
  sortBy: "c_act_code",
});

const receiptListColumns = ref([
  {
    name: "c_receipt_no",
    label: "收據",
    field: "c_receipt_no",
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: "1px solid",
      textAlign: "center",
      lineHeight: "10px",
    },
  },
  {
    name: "d_clear",
    label: "日期",
    field: "d_clear",
    sortable: true,
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: "1px solid",
      textAlign: "center",
      lineHeight: "10px",
    },
    format: (val) => qdate.formatDate(val, "YYYY年M月D日"),
  },
  {
    name: "c_type",
    label: "會計類別",
    field: "c_type",
    sortable: true,
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: "1px solid",
      textAlign: "center",
      lineHeight: "10px",
    },
  },
  {
    name: "c_name",
    label: "付款人",
    field: "c_name",
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: "1px solid",
      textAlign: "center",
      lineHeight: "10px",
    },
  },
  {
    name: "c_desc",
    label: "收費項目",
    field: "c_desc",
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: "1px solid",
      textAlign: "center",
      lineHeight: "10px",
    },
  },
  {
    name: "u_price_after_discount",
    label: "金額(HKD)",
    field: "u_price_after_discount",
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: "1px solid",
      textAlign: "center",
      lineHeight: "10px",
    },
  },
]);

const accountReportColumns = ref([
  {
    name: "c_act_code",
    label: "活動編號",
    field: "c_act_code",
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: "1px solid",
      textAlign: "center",
      lineHeight: "10px",
    },
  },
  {
    name: "c_desc",
    label: "收費項目",
    field: "c_desc",
    sortable: true,
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: "1px solid",
      textAlign: "center",
      lineHeight: "10px",
    },
  },
  {
    name: "amount",
    label: "金額(HKD)",
    field: "amount",
    sortable: true,
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: "1px solid",
      textAlign: "center",
      lineHeight: "10px",
    },
  },
  {
    name: "number",
    label: "數量",
    field: "number",
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: "1px solid",
      textAlign: "center",
      lineHeight: "10px",
    },
  },
  {
    name: "total",
    label: "總金額",
    field: "total",
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: "1px solid",
      textAlign: "center",
      lineHeight: "10px",
    },
  },
]);

const printObj = ref({
  id: "printMe",
  preview: false,
  previewTitle: "列印預覽", // The title of the preview window. The default is 打印预览
  popTitle: "收據報表",
});

// query - load graphql subscription on account list
const { result, loading, refetch } = useQuery(
  gql`
    query getAllReceipt(
      $condition: tbl_account_bool_exp = { c_receipt_no: { _eq: "" } }
    ) {
      tbl_account(order_by: { c_receipt_no: desc }, where: $condition) {
        c_receipt_no
        b_OtherIncome
        b_refund
        c_act_code
        c_desc
        c_mem_id
        c_name
        c_type
        d_clear
        d_create
        i_receipt_type
        u_price_after_discount
        b_delete
        c_user_id
      }
    }
  `,
  () => ({
    condition: {
      _and: [
        {
          d_create: {
            _gte: qdate.formatDate(
              qdate.startOfDate(
                qdate.extractDate(reportStartDate.value, "YYYY/MM/DD"),
                "day"
              ),
              "YYYY-MM-DDTHH:mm:ss"
            ),
          },
        },
        {
          d_create: {
            _lte: qdate.formatDate(
              qdate.endOfDate(
                qdate.extractDate(reportEndDate.value, "YYYY/MM/DD"),
                "day"
              ),
              "YYYY-MM-DDTHH:mm:ss"
            ),
          },
        },
        reportEvent.value ? { c_act_code: { _eq: reportEvent.value } } : {},
        reportStaff.value
          ? {
              c_user_id: {
                _in: [
                  reportStaff.value.label in staffNameMapping
                    ? staffNameMapping[reportStaff.value.label]
                    : reportStaff.value.label,
                  reportStaff.value.label,
                ],
              },
            }
          : {},
      ],
    },
  })
);

// computed
const username = computed(() => $store.getters["userModule/getUsername"]);
const AllData = computed(() => result.value?.tbl_account ?? []);
const ReceiptData = computed(() =>
  AllData.value ? AllData.value.filter((x) => !x.b_delete) : []
);
const DeletedData = computed(() =>
  AllData.value ? AllData.value.filter((x) => x.b_delete) : []
);
const PFData = computed(() => {
  let res = [];
  if (ReceiptData.value) {
    ReceiptData.value.forEach((rec) => {
      if (rec.c_type == "PF" && !rec.b_delete && !rec.b_refund) {
        let i = res.findIndex(
          (element) =>
            element.c_act_code == rec.c_act_code &&
            element.amount == rec.u_price_after_discount
        );
        if (i == -1) {
          res.push({
            c_act_code: rec.c_act_code,
            c_desc: rec.c_desc,
            c_type: rec.c_type,
            amount: rec.u_price_after_discount,
            number: 1,
            total: rec.u_price_after_discount,
          });
        } else {
          res[i].number = res[i].number + 1;
          res[i].total = res[i].total + rec.u_price_after_discount;
        }
      }
    });
  }
  return res;
});

const MFData = computed(() => {
  let res = [];
  if (ReceiptData.value) {
    ReceiptData.value.forEach((rec) => {
      if (rec.c_type == "MF" && !rec.b_delete && !rec.b_refund) {
        let i = res.findIndex(
          (element) =>
            element.c_act_code == rec.c_act_code &&
            element.amount == rec.u_price_after_discount
        );
        if (i == -1) {
          res.push({
            c_act_code: rec.c_act_code,
            c_desc: rec.c_desc,
            c_type: rec.c_type,
            amount: rec.u_price_after_discount,
            number: 1,
            total: rec.u_price_after_discount,
          });
        } else {
          res[i].number = res[i].number + 1;
          res[i].total = res[i].total + rec.u_price_after_discount;
        }
      }
    });
  }
  return res;
});

const CFData = computed(() => {
  let res = [];
  if (ReceiptData.value) {
    ReceiptData.value.forEach((rec) => {
      if (rec.c_type == "CF" && !rec.b_delete && !rec.b_refund) {
        let i = res.findIndex(
          (element) =>
            element.c_act_code == rec.c_act_code &&
            element.amount == rec.u_price_after_discount
        );
        if (i == -1) {
          res.push({
            c_act_code: rec.c_act_code,
            c_desc: rec.c_desc,
            c_type: rec.c_type,
            amount: rec.u_price_after_discount,
            number: 1,
            total: rec.u_price_after_discount,
          });
        } else {
          res[i].number = res[i].number + 1;
          res[i].total = res[i].total + rec.u_price_after_discount;
        }
      }
    });
  }
  return res;
});

const RFData = computed(() => {
  let res = [];
  if (ReceiptData.value) {
    ReceiptData.value.forEach((rec) => {
      if (rec.c_type == "RF" && !rec.b_delete && !rec.b_refund) {
        let i = res.findIndex(
          (element) =>
            element.c_act_code == rec.c_act_code &&
            element.amount == rec.u_price_after_discount
        );
        if (i == -1) {
          res.push({
            c_act_code: rec.c_act_code,
            c_desc: rec.c_desc,
            c_type: rec.c_type,
            amount: rec.u_price_after_discount,
            number: 1,
            total: rec.u_price_after_discount,
          });
        } else {
          res[i].number = res[i].number + 1;
          res[i].total = res[i].total + rec.u_price_after_discount;
        }
      }
    });
  }
  return res;
});

const SFData = computed(() => {
  let res = [];
  if (ReceiptData.value) {
    ReceiptData.value.forEach((rec) => {
      if (rec.c_type == "SF" && !rec.b_delete && !rec.b_refund) {
        let i = res.findIndex(
          (element) =>
            element.c_act_code == rec.c_act_code &&
            element.amount == rec.u_price_after_discount
        );
        if (i == -1) {
          res.push({
            c_act_code: rec.c_act_code,
            c_desc: rec.c_desc,
            c_type: rec.c_type,
            amount: rec.u_price_after_discount,
            number: 1,
            total: rec.u_price_after_discount,
          });
        } else {
          res[i].number = res[i].number + 1;
          res[i].total = res[i].total + rec.u_price_after_discount;
        }
      }
    });
  }
  return res;
});

const NewMemberData = computed(() => {
  let res = [];
  if (ReceiptData.value) {
    ReceiptData.value.forEach((rec) => {
      if (rec.c_type == "新會員費" && !rec.b_delete && !rec.b_refund) {
        let i = res.findIndex(
          (element) =>
            element.c_act_code == rec.c_act_code &&
            element.amount == rec.u_price_after_discount
        );
        if (i == -1) {
          res.push({
            c_act_code: rec.c_act_code,
            c_desc: rec.c_desc,
            c_type: rec.c_type,
            amount: rec.u_price_after_discount,
            number: 1,
            total: rec.u_price_after_discount,
          });
        } else {
          res[i].number = res[i].number + 1;
          res[i].total = res[i].total + rec.u_price_after_discount;
        }
      }
    });
  }
  return res;
});

const RenewMemberData = computed(() => {
  let res = [];
  if (ReceiptData.value) {
    ReceiptData.value.forEach((rec) => {
      if (rec.c_type == "續會員費" && !rec.b_delete && !rec.b_refund) {
        let i = res.findIndex(
          (element) =>
            element.c_act_code == rec.c_act_code &&
            element.amount == rec.u_price_after_discount
        );
        if (i == -1) {
          res.push({
            c_act_code: rec.c_act_code,
            c_desc: rec.c_desc,
            c_type: rec.c_type,
            amount: rec.u_price_after_discount,
            number: 1,
            total: rec.u_price_after_discount,
          });
        } else {
          res[i].number = res[i].number + 1;
          res[i].total = res[i].total + rec.u_price_after_discount;
        }
      }
    });
  }
  return res;
});
/*
const QuitData = computed(() => MemberData.value? MemberData.value.filter((x) => x.d_exit_1 != null): [])
const YouthData = computed(() => MemberData.value?
  MemberData.value.filter((x) => Report.sisFilter(reportDate, 'youth', x)
) : [])

const Family_15Data = computed(() => MemberData.value? MemberData.value.filter((x) =>
  Report.sisFilter(reportDate, 'child', x)
) : [])

const Family_24Data = computed(() => MemberData.value? MemberData.value.filter((x) =>
  Report.sisFilter(reportDate, 'family', x)
): [])

const ErrorData = computed(() => MemberData.value? MemberData.value.filter((x) =>
  (
    x.d_birth == null ||
    x.d_birth > reportDate.value ||
    x.d_enter_1 == null
  ) &&
  x.c_udf_1 != "社區義工" &&
  (
    (x.d_expired_1 == null) ||
    (x.d_expired_1 && qdate.getDateDiff(x.d_expired_1, reportDate.value) > 0)
  )
  ): [])

const ExpiredData = computed(() => MemberData.value? MemberData.value.filter((x) =>
  !x.d_exit_1 &&
  x.d_expired_1 && qdate.getDateDiff(x.d_expired_1, reportDate.value) < 0 &&
  qdate.isBetweenDates(x.d_expired_1, qdate.startOfDate(reportDate.value, 'month'), qdate.endOfDate(reportDate.value, 'month'))
): [])
*/
// functions
function exportExcel(datasource, columns, filename) {
  let content = Excel.jsonToXLS(datasource, columns);

  const status = exportFile(filename + ".xls", content, "text/xls");

  if (status !== true) {
    $q.notify({
      message: "瀏覽器阻止下載檔案...",
      color: "negative",
      icon: "warning",
    });
  }
}

function rowDetail(evt, row, index) {
  if (evt.target.nodeName === "TD") {
    detailModal.value = true;
    showReceiptNo.value = row.c_receipt_no;
  }
}

function eventDetail(evt, row, index) {
  if (evt.target.nodeName === "TD") {
    EventDetailModal.value = true;
    showEventID.value = row.c_act_code;
  }
}

function reset() {
  reportStartDate.value = qdate.formatDate(
    qdate.startOfDate(Date.now(), "month"),
    "YYYY/MM/DD"
  );
  reportEndDate.value = qdate.formatDate(
    qdate.endOfDate(Date.now(), "month"),
    "YYYY/MM/DD"
  );
  reportEvent.value = null;
  reportStaff.value = null;
}
</script>

<script>
import print from "vue3-print-nb";

export default {
  name: "ReceiptReport",
  directives: {
    print,
  },
};
</script>

<style lang="scss" scoped>
@media screen {
  .hideOnScreen {
    display: none;
  }
}

@media print {
  .hideOnPrint {
    display: none;
  }
  .print-title {
    font-size: 0.4rem;
    line-height: 25px;
  }
}
</style>
