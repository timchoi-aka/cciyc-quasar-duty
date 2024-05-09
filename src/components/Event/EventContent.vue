<template>
  <!-- loading dialog -->
  <LoadingDialog v-model="loading" message="處理中" />

  <!-- delete modal -->
  <q-dialog v-model="deleteDialog">
    <q-card>
      <q-card-section class="text-h6 bg-primary text-white">
        刪除活動
      </q-card-section>
      <q-card-section class="text-h6">
        <div>確定刪除活動？刪除後將不能回復！</div>
        <div>請在以下輸入活動編號{{ c_act_code }}</div>
        <q-input type="text" v-model="deleteCheck" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          :disable="deleteCheck != c_act_code.trim()"
          icon="check"
          label="確定"
          class="bg-positive text-white"
          v-close-popup="-1"
          @click="deleteAct"
        />
        <q-btn
          icon="cancel"
          label="取消"
          class="bg-negative text-white"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-card
    v-if="$q.screen.gt.xs"
    bordered
    flat
    class="q-pa-none q-ma-none text-h6 fit"
  >
    <q-card-section class="row bg-grey-2 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-grey-4" size="xl"
        >基本資料
        <q-btn
          v-if="!edit"
          icon="edit"
          class="text-primary"
          flat
          @click="startEdit(Event)"
        >
          <q-tooltip class="bg-white text-primary">修改</q-tooltip>
        </q-btn>
        <q-btn v-if="edit" icon="save" flat @click="saveEdit(editObject)">
          <q-tooltip class="bg-white text-primary">儲存</q-tooltip>
        </q-btn>
        <q-btn v-if="edit" icon="cancel" flat @click="edit = false">
          <q-tooltip class="bg-white text-primary">取消</q-tooltip>
        </q-btn>
        <q-btn
          v-if="!edit && isCenterIC"
          icon="delete"
          class="text-negative"
          flat
          @click="deleteDialog = true"
        >
          <q-tooltip class="bg-white text-negative">刪除</q-tooltip>
        </q-btn>
      </q-chip>
      <div class="row q-gutter-lg q-ml-sm col-12 justify-start">
        <span class="col-auto row">
          <div class="col-12">活動編號:</div>
          <div class="col-12">{{ c_act_code }}</div>
        </span>
        <span class="col-grow row justify-start">
          <div class="col-12 row">
            <span class="col-auto">活動名稱(中文): </span
            ><q-input
              v-if="edit"
              filled
              type="text"
              class="col-grow text-h6"
              v-model="editObject.c_act_name"
            /><span class="text-h6 col-auto" v-else>{{
              Event.c_act_name
            }}</span>
          </div>
          <div class="col-12 row q-mt-sm">
            <span class="col-auto">活動名稱(英文): </span
            ><q-input
              class="col-grow text-h6"
              filled
              v-if="edit"
              type="text"
              v-model="editObject.c_act_nameen"
            /><span class="text-h6 col-auto" v-else>{{
              Event.c_act_nameen
            }}</span>
          </div>
        </span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-yellow-2 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-yellow-4" size="xl">類別</q-chip>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >會計類別：
          <q-select
            v-if="edit"
            :options="acc_type"
            v-model="editObject.c_acc_type"
          /><span v-else>{{ Event.c_acc_type }}</span></span
        >
        <span class="col-3"
          >狀況:
          <q-select
            v-if="edit"
            :options="status"
            v-model="editObject.c_status"
          /><span v-else>{{ Event.c_status }}</span></span
        >
        <span class="col-2 column">
          <span class="col"
            >免費:
            <q-checkbox v-if="edit" v-model="editObject.b_freeofcharge" /><span
              v-else
              ><q-icon
                class="text-green"
                v-if="Event.b_freeofcharge"
                name="check" /><q-icon
                class="text-red"
                v-else
                name="cancel" /></span
          ></span>
          <span class="col"
            >完成: <q-checkbox v-if="edit" v-model="editObject.b_finish" /><span
              v-else
              ><q-icon
                class="text-green"
                v-if="Event.b_finish"
                name="check" /><q-icon
                class="text-red"
                v-else
                name="cancel" /></span
          ></span>
        </span>
        <span class="col-3"
          >達標日期:
          <span v-if="edit">
            <DateComponent v-model="editObject.d_finish_goal" /> </span
          ><span v-else>{{
            qdate.formatDate(Event.d_finish_goal, "YYYY年M月D日")
          }}</span></span
        >
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >類別：
          <q-select
            v-if="edit"
            filled
            :options="type"
            v-model="editObject.c_type"
          /><span v-else>{{ Event.c_type }}</span></span
        >
        <span class="col-7"
          >性質：
          <q-select
            v-if="edit"
            filled
            :options="nature"
            v-model="editObject.c_nature"
          /><span v-else>{{ Event.c_nature }}</span></span
        >
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >大分類：
          <q-select
            v-if="edit"
            filled
            :options="group1"
            v-model="editObject.c_group1"
          /><span v-else>{{ Event.c_group1 }}</span></span
        >
        <span class="col-7"
          >細類：
          <q-select
            v-if="edit"
            filled
            :options="group2"
            v-model="editObject.c_group2"
          /><span v-else>{{ Event.c_group2 }}</span></span
        >
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >對象:
          <q-select
            v-if="edit"
            filled
            :options="whojoin"
            v-model="editObject.c_whojoin"
          /><span v-else>{{ Event.c_whojoin }}</span></span
        >
        <span class="col-3"
          >負責職員:
          <q-select
            v-if="edit"
            filled
            :options="UserList"
            v-model="editObject.c_respon"
          /><span v-else>{{ Event.c_respon }}</span></span
        >
        <span class="col-3"
          >協助職員:
          <StaffSelectionMultiple
            :includeTemp="true"
            v-if="edit"
            hint="先刪除舊清單才能修改"
            v-model="editObject.c_worker"
          /><span v-else>{{ Event.c_worker }}</span>
        </span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-red-1 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-red-3" size="xl">活動資料</q-chip>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >開始日期:
          <span v-if="edit">
            <DateComponent v-model="editObject.d_date_from" /> </span
          ><span v-else>{{ Event.d_date_from }}</span></span
        >
        <span class="col-3"
          >開始時間:
          <span v-if="edit">
            <TimeComponent v-model="editObject.d_time_from" /> </span
          ><span v-else>{{ Event.d_time_from }}</span></span
        >
        <span class="col-3"
          >報名日期(開始):
          <span v-if="edit">
            <DateComponent v-model="editObject.d_sale_start" /> </span
          ><span v-else>{{ Event.d_sale_start }}</span></span
        >
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >終結日期:
          <span v-if="edit">
            <DateComponent v-model="editObject.d_date_to" /> </span
          ><span v-else>{{ Event.d_date_to }}</span></span
        >
        <span class="col-3"
          >終結時間:
          <span v-if="edit">
            <TimeComponent v-model="editObject.d_time_to" /> </span
          ><span v-else>{{ Event.d_time_to }}</span></span
        >
        <span class="col-3"
          >報名日期(完結):
          <span v-if="edit">
            <DateComponent v-model="editObject.d_sale_end" /> </span
          ><span v-else>{{ Event.d_sale_end }}</span></span
        >
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >名額:
          <q-input
            v-if="edit"
            filled
            type="number"
            v-model="editObject.i_quota_max"
          /><span v-else>{{ Event.i_quota_max }}</span></span
        >
        <span class="col-3"
          >總堂數:
          <q-input
            v-if="edit"
            filled
            type="number"
            v-model="editObject.i_lessons"
          /><span v-else>{{ Event.i_lessons }}</span></span
        >
        <span class="col-3"
          >逢星期:
          <WeekSelection v-if="edit" v-model="editObject.c_week" /><span
            v-else
            >{{ Event.c_week }}</span
          ></span
        >
      </div>
    </q-card-section>

    <q-card-section class="row col-12 bg-brown-1 q-pl-none q-pt-none q-pb-lg">
      <div class="col-6 row items-start content-start">
        <q-chip class="col-12 row bg-brown-3" size="lg">地點</q-chip>
        <div class="row col-12 q-gutter-lg q-ml-sm items-start">
          <span class="col-11"
            >舉行地點:
            <DestSelection v-if="edit" v-model="editObject.c_dest" /><span
              v-else
              >{{ Event.c_dest }}</span
            ></span
          >
          <span class="col-11"
            >集合地點:
            <DestSelection
              v-if="edit"
              v-model="editObject.c_start_collect"
            /><span v-else>{{ Event.c_start_collect }}</span></span
          >
          <span class="col-11"
            >解散地點:
            <DestSelection
              v-if="edit"
              v-model="editObject.c_end_collect"
            /><span v-else>{{ Event.c_end_collect }}</span></span
          >
        </div>
      </div>
      <div class="col-6 row items-start content-start">
        <q-chip class="col-12 bg-brown-2" size="lg">網頁</q-chip>
        <div class="row col-12 q-gutter-lg q-ml-sm">
          <span class="col-12 row"
            >顯示網頁:
            <q-checkbox v-if="edit" v-model="editObject.IsShow" /><span v-else
              ><q-icon
                class="text-green"
                v-if="Event.IsShow"
                name="check" /><q-icon
                class="text-red"
                v-else
                name="cancel" /></span
          ></span>
          <span class="col-12 row"
            >網頁海報: <span v-if="edit">{{ editObject.poster }}</span
            ><span v-else>{{ Event.poster }}</span>
            <div class="col-12 row" v-if="edit">
              <q-btn
                icon="delete"
                class="bg-negative text-white"
                label="刪除現有海報"
                @click="editObject.poster = ''"
              />
              <FileUpload
                class="col-11"
                mode="single"
                path=""
                @onDone="(val) => updateFilenames(val)"
              />
            </div>
            <div class="col-12 row" v-else>
              <q-img
                v-if="Event.poster"
                class="col-11"
                :src="Event.poster"
                fit="scale-down"
              />
              <div v-else>沒有海報</div>
            </div>
          </span>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="row bg-green-1 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-green-3" size="lg">備註</q-chip>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-11">收據: </span>
        <span class="col-11" style="border: 1px solid"
          ><q-input
            v-if="edit"
            type="textarea"
            v-model="editObject.m_remind_content"
          /><span v-else>{{ Event.m_remind_content }}</span></span
        >
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm q-mt-sm q-pb-md">
        <span class="col-11">備註: </span>
        <span class="col-11" style="border: 1px solid"
          ><q-input
            v-if="edit"
            type="textarea"
            v-model="editObject.m_remark"
          /><span v-else>{{ Event.m_remark }}</span></span
        >
      </div>
    </q-card-section>
  </q-card>

  <!-- mobile interface -->
  <div v-else>
    <!-- 基本資料 -->
    <q-expansion-item header-class="bg-grey-4 text-body1">
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="info" />
        </q-item-section>
        <q-item-section>
          <span>基本資料</span>
        </q-item-section>
      </template>
      <div class="row q-px-sm col-12 justify-start text-body1">
        <span class="col-auto row items-start">
          <div class="col-auto">活動編號:</div>
          <div class="col-auto">{{ c_act_code }}</div>
        </span>
        <span class="col-12 row justify-start items-start">
          <div class="col-12 row">
            <span class="col-auto">活動名稱(中文): </span
            ><q-input
              v-if="edit"
              filled
              type="text"
              class="col-grow"
              v-model="editObject.c_act_name"
            /><span class="col-auto" v-else>{{ Event.c_act_name }}</span>
          </div>
          <div class="col-12 row">
            <span class="col-auto">活動名稱(英文): </span
            ><q-input
              class="col-grow"
              filled
              v-if="edit"
              type="text"
              v-model="editObject.c_act_nameen"
            /><span class="col-auto" v-else>{{ Event.c_act_nameen }}</span>
          </div>
        </span>
      </div>
    </q-expansion-item>

    <!-- 類別 -->
    <q-expansion-item header-class="bg-yellow-4 text-body1">
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="category" />
        </q-item-section>
        <q-item-section>
          <span>類別</span>
        </q-item-section>
      </template>
      <div class="row col-12 q-px-sm text-body1">
        <span class="col-12"
          >會計類別：
          <q-select
            v-if="edit"
            :options="acc_type"
            v-model="editObject.c_acc_type"
          /><span v-else>{{ Event.c_acc_type }}</span></span
        >
        <span class="col-12"
          >狀況:
          <q-select
            v-if="edit"
            :options="status"
            v-model="editObject.c_status"
          /><span v-else>{{ Event.c_status }}</span></span
        >
        <span class="col-12 row">
          <span class="col"
            >免費:
            <q-checkbox v-if="edit" v-model="editObject.b_freeofcharge" /><span
              v-else
              ><q-icon
                class="text-green"
                v-if="Event.b_freeofcharge"
                name="check" /><q-icon
                class="text-red"
                v-else
                name="cancel" /></span
          ></span>
          <span class="col"
            >完成: <q-checkbox v-if="edit" v-model="editObject.b_finish" /><span
              v-else
              ><q-icon
                class="text-green"
                v-if="Event.b_finish"
                name="check" /><q-icon
                class="text-red"
                v-else
                name="cancel" /></span
          ></span>
        </span>
        <span class="col-12"
          >達標日期:
          <span v-if="edit">
            <DateComponent v-model="editObject.d_finish_goal" /> </span
          ><span v-else>{{
            qdate.formatDate(Event.d_finish_goal, "YYYY年M月D日")
          }}</span></span
        >
        <span class="col-12"
          >類別：
          <q-select
            v-if="edit"
            filled
            :options="type"
            v-model="editObject.c_type"
          /><span v-else>{{ Event.c_type }}</span></span
        >
        <span class="col-12"
          >性質：
          <q-select
            v-if="edit"
            filled
            :options="nature"
            v-model="editObject.c_nature"
          /><span v-else>{{ Event.c_nature }}</span></span
        >
        <span class="col-12"
          >大分類：
          <q-select
            v-if="edit"
            filled
            :options="group1"
            v-model="editObject.c_group1"
          /><span v-else>{{ Event.c_group1 }}</span></span
        >
        <span class="col-12"
          >細類：
          <q-select
            v-if="edit"
            filled
            :options="group2"
            v-model="editObject.c_group2"
          /><span v-else>{{ Event.c_group2 }}</span></span
        >
        <span class="col-12"
          >對象:
          <q-select
            v-if="edit"
            filled
            :options="whojoin"
            v-model="editObject.c_whojoin"
          /><span v-else>{{ Event.c_whojoin }}</span></span
        >
        <span class="col-12"
          >負責職員:
          <q-select
            v-if="edit"
            filled
            :options="UserList"
            v-model="editObject.c_respon"
          /><span v-else>{{ Event.c_respon }}</span></span
        >
        <span class="col-12"
          >協助職員:
          <StaffSelectionMultiple
            :includeTemp="true"
            v-if="edit"
            hint="先刪除舊清單才能修改"
            v-model="editObject.c_worker"
          /><span v-else>{{ Event.c_worker }}</span>
        </span>
      </div>
    </q-expansion-item>

    <!-- 活動資料 -->
    <q-expansion-item header-class="bg-red-3 text-body1">
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="event_note" />
        </q-item-section>
        <q-item-section>
          <span>活動資料</span>
        </q-item-section>
      </template>
      <div class="row col-12 q-px-sm text-body1">
        <span class="col-12"
          >開始日期:
          <span v-if="edit">
            <DateComponent v-model="editObject.d_date_from" /> </span
          ><span v-else>{{ Event.d_date_from }}</span></span
        >
        <span class="col-12"
          >開始時間:
          <span v-if="edit">
            <TimeComponent v-model="editObject.d_time_from" /> </span
          ><span v-else>{{ Event.d_time_from }}</span></span
        >
        <span class="col-12"
          >報名日期(開始):
          <span v-if="edit">
            <DateComponent v-model="editObject.d_sale_start" /> </span
          ><span v-else>{{ Event.d_sale_start }}</span></span
        >
        <span class="col-12"
          >終結日期:
          <span v-if="edit">
            <DateComponent v-model="editObject.d_date_to" /> </span
          ><span v-else>{{ Event.d_date_to }}</span></span
        >
        <span class="col-12"
          >終結時間:
          <span v-if="edit">
            <TimeComponent v-model="editObject.d_time_to" /> </span
          ><span v-else>{{ Event.d_time_to }}</span></span
        >
        <span class="col-12"
          >報名日期(完結):
          <span v-if="edit">
            <DateComponent v-model="editObject.d_sale_end" /> </span
          ><span v-else>{{ Event.d_sale_end }}</span></span
        >
        <span class="col-12"
          >名額:
          <q-input
            v-if="edit"
            filled
            type="number"
            v-model="editObject.i_quota_max"
          /><span v-else>{{ Event.i_quota_max }}</span></span
        >
        <span class="col-12"
          >總堂數:
          <q-input
            v-if="edit"
            filled
            type="number"
            v-model="editObject.i_lessons"
          /><span v-else>{{ Event.i_lessons }}</span></span
        >
        <span class="col-12"
          >逢星期:
          <WeekSelection v-if="edit" v-model="editObject.c_week" /><span
            v-else
            >{{ Event.c_week }}</span
          ></span
        >
      </div>
    </q-expansion-item>

    <!-- 地點 -->
    <q-expansion-item header-class="bg-brown-3 text-body1">
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="location_on" />
        </q-item-section>
        <q-item-section>
          <span>地點</span>
        </q-item-section>
      </template>
      <div class="row col-12 q-px-sm text-body1">
        <span class="col-11"
          >舉行地點:
          <DestSelection v-if="edit" v-model="editObject.c_dest" /><span
            v-else
            >{{ Event.c_dest }}</span
          ></span
        >
        <span class="col-11"
          >集合地點:
          <DestSelection
            v-if="edit"
            v-model="editObject.c_start_collect"
          /><span v-else>{{ Event.c_start_collect }}</span></span
        >
        <span class="col-11"
          >解散地點:
          <DestSelection v-if="edit" v-model="editObject.c_end_collect" /><span
            v-else
            >{{ Event.c_end_collect }}</span
          ></span
        >
      </div>
    </q-expansion-item>

    <!-- 網頁 -->
    <q-expansion-item header-class="bg-brown-2 text-body1">
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="home" />
        </q-item-section>
        <q-item-section>
          <span>網頁</span>
        </q-item-section>
      </template>
      <div class="row col-12 q-px-sm text-body1">
        <span class="col-12 row"
          >顯示網頁: <q-checkbox v-if="edit" v-model="editObject.IsShow" /><span
            v-else
            ><q-icon
              class="text-green"
              v-if="Event.IsShow"
              name="check" /><q-icon
              class="text-red"
              v-else
              name="cancel" /></span
        ></span>
        <span class="col-12 row"
          >網頁海報: <span v-if="edit">{{ editObject.poster }}</span
          ><span v-else>{{ Event.poster }}</span>
          <div class="col-12 row" v-if="edit">
            <q-btn
              icon="delete"
              class="bg-negative text-white"
              label="刪除現有海報"
              @click="editObject.poster = ''"
            />
            <FileUpload
              class="col-11"
              mode="single"
              path=""
              @onDone="(val) => updateFilenames(val)"
            />
          </div>
          <div class="col-12 row" v-else>
            <q-img
              v-if="Event.poster"
              class="col-11"
              :src="Event.poster"
              fit="scale-down"
            />
            <div v-else>沒有海報</div>
          </div>
        </span>
      </div>
    </q-expansion-item>

    <!-- 備註 -->
    <q-expansion-item header-class="bg-green-3 text-body1">
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="help" />
        </q-item-section>
        <q-item-section>
          <span>備註</span>
        </q-item-section>
      </template>
      <div class="row col-12 q-px-sm text-body1">
        <span class="col-12">收據: </span>
        <span class="col-12" style="border: 1px solid"
          ><q-input
            v-if="edit"
            type="textarea"
            v-model="editObject.m_remind_content"
          /><span v-else>{{ Event.m_remind_content }}</span></span
        >
        <span class="col-12">備註: </span>
        <span class="col-12" style="border: 1px solid"
          ><q-input
            v-if="edit"
            type="textarea"
            v-model="editObject.m_remark"
          /><span v-else>{{ Event.m_remark }}</span></span
        >
      </div>
    </q-expansion-item>
  </div>

  <!-- sticky button at bottom - mobile only -->
  <q-page-sticky
    v-if="$q.screen.lt.sm"
    position="bottom-right"
    :offset="[20, 20]"
    style="z-index: 1"
  >
    <q-fab unelevated color="primary" icon="keyboard_arrow_up" direction="up">
      <q-fab-action
        v-if="!edit"
        label="修改"
        icon="edit"
        class="bg-white text-primary"
        push
        @click="startEdit(Event)"
      />
      <q-fab-action
        v-if="edit"
        label="儲存"
        icon="save"
        class="bg-white text-positive"
        push
        @click="saveEdit(editObject)"
      />
      <q-fab-action
        v-if="edit"
        label="取消"
        icon="cancel"
        class="bg-white text-warning"
        push
        @click="edit = false"
      />
      <q-fab-action
        v-if="!edit && isCenterIC"
        label="刪除"
        icon="delete"
        class="text-negative"
        push
        @click="deleteDialog = true"
      />
    </q-fab>
  </q-page-sticky>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { date as qdate, useQuasar } from "quasar";
import { EVENT_BY_PK } from "/src/graphQueries/Event/query.js";
import {
  DELETE_EVENT_BY_PK,
  UPDATE_EVENT_BY_PK,
} from "/src/graphQueries/Event/mutation.js";
import { useQuery, useMutation } from "@vue/apollo-composable";
import DateComponent from "components/Basic/DateComponent.vue";
import TimeComponent from "components/Basic/TimeComponent.vue";
import LoadingDialog from "components/LoadingDialog.vue";
import { usersCollection, FirebaseAuth } from "boot/firebase";
import { getDocs, query, where } from "firebase/firestore";
import StaffSelectionMultiple from "src/components/Basic/StaffSelectionMultiple.vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import FileUpload from "src/components/Basic/FileUpload.vue";
import { useEventProvider } from "src/providers/event.js";
import User from "src/components/class/user.js";
import WeekSelection from "src/components/Basic/WeekSelection.vue";
import DestSelection from "src/components/Basic/DestSelection.vue";

const route = useRoute();
const router = useRouter();
const c_act_code = ref(route.params.id);

// variables
const $q = useQuasar();
const $store = useStore();
const edit = ref(false);
const editObject = ref({});
const deleteDialog = ref(false);
const deleteCheck = ref("");
const serverObject = ref({});
const textBuffer = ref("");
const loading = ref(0);
const upload_API =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5001/manage-hr/asia-east2"
    : "https://asia-east2-manage-hr.cloudfunctions.net";
const WEB_IMG_PREFIX =
  process.env.NODE_ENV === "development"
    ? "http://localhost:9199/cciyc-web/"
    : "https://storage.googleapis.com/cciyc-web/";
const acc_type = ref(["PF", "OF", "MF", "SF"]);

const status = ref(["完成達標", "未完成", "取消", "完成不達標"]);

const type = ref(["小組", "活動", "課堂", "偶到", "其他"]);

const nature = ref([
  "核心青年服務A",
  "核心青年服務B",
  "核心青年服務C",
  "核心青年服務D",
  "非核心青年服務",
  "其他服務",
]);

const group1 = ref([
  "社交/興趣",
  "學習/發展",
  "義務工作",
  "青少年就業",
  "家長服務",
  "新來港人士服務",
  "社區服務",
  "中心設施",
]);

const group2 = ref([
  "領袖訓練",
  "青年義務工作",
  "參與地區公民事務",
  "內地交流活動",
]);

const whojoin = ref([
  "2.5-5歲幼兒",
  "2-6歲幼兒",
  "6-14歲兒童/青少年",
  "7-11歲兒童",
  "12-14歲青少年",
  "15-24歲青年",
  "義工",
  "童軍",
  "親子",
  "新來港人士",
  "其他人士",
]);

const whojoin_class = ref({
  "2-6歲幼兒": 1,
  "15-24歲青年": 4,
  其他人士: 6,
  義工: 8,
  童軍: 9,
  "12-14歲青少年": 10,
  "7-11歲兒童": 11,
  親子: 12,
  新來港人士: 13,
  "6-14歲兒童/青少年": 14,
  "2.5-5歲幼兒": 15,
});

// call eventProvider
const {
  result: EventData,
  refetch,
  deleteEventById,
  updateEventById,
  message,
} = useEventProvider({
  c_act_code: c_act_code,
});

// watch for message
watch(message, (value) => {
  if (value) {
    $q.notify({ message: value });
  }
});

// load user list
const UserList = ref([]);
User.loadPermUsers().then((result) => {
  UserList.value = result.map((user) => user.name);
});

// computed
const username = computed(() => $store.getters["userModule/getUsername"]);
const Event = computed(() => EventData.value?.HTX_Event_by_pk ?? []);
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"]);

// functions
/**
 * Start editing content
 * clone the value to an edit object
 * @returns {any}
 */
function startEdit(obj) {
  for (const [key, value] of Object.entries(obj)) {
    editObject.value[key] = value;
  }
  delete editObject.value["__typename"];
  editObject.value.d_date_from = editObject.value.d_date_from
    ? qdate.formatDate(
        qdate.extractDate(editObject.value.d_date_from, "D/M/YYYY"),
        "YYYY-MM-DD"
      )
    : null;
  editObject.value.d_date_to = editObject.value.d_date_to
    ? qdate.formatDate(
        qdate.extractDate(editObject.value.d_date_to, "D/M/YYYY"),
        "YYYY-MM-DD"
      )
    : null;
  editObject.value.d_sale_start = editObject.value.d_sale_start
    ? qdate.formatDate(
        qdate.extractDate(editObject.value.d_sale_start, "D/M/YYYY"),
        "YYYY-MM-DD"
      )
    : null;
  editObject.value.d_sale_end = editObject.value.d_sale_end
    ? qdate.formatDate(
        qdate.extractDate(editObject.value.d_sale_end, "D/M/YYYY"),
        "YYYY-MM-DD"
      )
    : null;
  editObject.value.d_finish_goal = editObject.value.d_finish_goal
    ? qdate.formatDate(editObject.value.d_finish_goal, "YYYY-MM-DD")
    : null;
  editObject.value.d_time_from = editObject.value.d_time_from
    ? qdate.formatDate(
        qdate.extractDate(editObject.value.d_time_from, "h:mm:ss A"),
        "HH:mm"
      )
    : null;
  editObject.value.d_time_to = editObject.value.d_time_to
    ? qdate.formatDate(
        qdate.extractDate(editObject.value.d_time_to, "h:mm:ss A"),
        "HH:mm"
      )
    : null;
  editObject.value.IsShow = editObject.value.IsShow == 1 ? true : false;
  edit.value = true;
}

/**
 * Update the filename of the poster
 * @param {any} filename
 * @returns {void}
 */
function updateFilenames(filename) {
  editObject.value.poster = WEB_IMG_PREFIX + filename.files[0].name;
}

/**
 * Save the edited content
 * @param {any} obj
 * @returns {void}
 */
function saveEdit(obj) {
  // format data for server
  serverObject.value = purityData(obj);

  updateEventById({
    staff_name: username.value,
    eventContent: serverObject.value,
    c_act_code: c_act_code.value,
  }).then(() => {
    edit.value = false;
    serverObject.value = {};
    editObject.value = {};
  });
}

/**
 * Delete the event
 * @returns {void}
 */
function deleteAct() {
  /* console.log({
    c_act_code: c_act_code,
    staff_name: username.value,
    eventContent: Event.value
  }) */

  deleteEventById({
    c_act_code: c_act_code.value,
    staff_name: username.value,
    eventContent: Event.value,
  }).then(() => {
    router.push({ name: "EventSearch" });
  });
}

/**
 * Purity data for server
 * @param {any} obj
 * @returns {any}
 */
function purityData(obj) {
  let returnObj = {};
  returnObj.c_act_code = c_act_code.value.trim();
  returnObj.c_act_name = obj.c_act_name ? obj.c_act_name.trim() : null;
  returnObj.c_act_nameen = obj.c_act_nameen ? obj.c_act_nameen.trim() : null;
  returnObj.b_freeofcharge = obj.b_freeofcharge ? true : false;
  returnObj.c_acc_type = obj.c_acc_type ? obj.c_acc_type.trim() : null;
  returnObj.c_group1 = obj.c_group1 ? obj.c_group1.trim() : null;
  returnObj.c_group2 = obj.c_group2 ? obj.c_group2.trim() : null;
  returnObj.c_nature = obj.c_nature ? obj.c_nature.trim() : null;
  returnObj.c_respon = obj.c_respon ? obj.c_respon.trim() : null;
  returnObj.c_respon2 = obj.c_respon2 ? obj.c_respon2.trim() : null;
  returnObj.c_dest = obj.c_dest ? obj.c_dest.trim() : null;
  returnObj.c_start_collect = obj.c_start_collect
    ? obj.c_start_collect.trim()
    : null;
  returnObj.c_end_collect = obj.c_end_collect ? obj.c_end_collect.trim() : null;
  returnObj.c_status = obj.c_status ? obj.c_status.trim() : null;
  returnObj.c_type = obj.c_type ? obj.c_type.trim() : null;
  returnObj.c_week = obj.c_week ? obj.c_week.trim() : null;
  returnObj.c_whojoin = obj.c_whojoin ? obj.c_whojoin.trim() : null;
  returnObj.c_worker = obj.c_worker
    ? Array.isArray(obj.c_worker)
      ? obj.c_worker.map((x) => x.label).join(",")
      : obj.c_worker.trim()
    : null;
  returnObj.c_worker2 = obj.c_worker2 ? obj.c_worker2.trim() : null;
  returnObj.d_date_from = obj.d_date_from
    ? qdate.formatDate(obj.d_date_from, "D/M/YYYY")
    : null;
  returnObj.d_date_to = obj.d_date_to
    ? qdate.formatDate(obj.d_date_to, "D/M/YYYY")
    : null;
  returnObj.d_sale_start = obj.d_sale_start
    ? qdate.formatDate(obj.d_sale_start, "D/M/YYYY")
    : null;
  returnObj.d_sale_end = obj.d_sale_end
    ? qdate.formatDate(obj.d_sale_end, "D/M/YYYY")
    : null;
  // append seconds
  returnObj.d_time_from = obj.d_time_from ? obj.d_time_from + ":00" : null;
  returnObj.d_time_to = obj.d_time_to ? obj.d_time_to + ":00" : null;
  // convert to 12H server format
  returnObj.d_time_from = returnObj.d_time_from
    ? qdate.formatDate(
        qdate.extractDate(returnObj.d_time_from, "HH:mm:ss"),
        "h:mm:ss A"
      )
    : null;
  returnObj.d_time_to = returnObj.d_time_to
    ? qdate.formatDate(
        qdate.extractDate(returnObj.d_time_to, "HH:mm:ss"),
        "h:mm:ss A"
      )
    : null;

  returnObj.m_remind_content = obj.m_remind_content
    ? obj.m_remind_content.trim()
    : null;
  returnObj.m_remark = obj.m_remark ? obj.m_remark.trim() : null;
  returnObj.poster = obj.poster ? obj.poster.trim() : null;
  returnObj.i_quota_max = obj.i_quota_max ? parseInt(obj.i_quota_max) : 0;
  returnObj.IsShow = obj.IsShow ? 1 : 0;
  returnObj.i_lessons = obj.i_lessons ? parseInt(obj.i_lessons) : 0;
  returnObj.d_finish_goal = obj.d_finish_goal;
  returnObj.b_finish = obj.b_finish ? true : false;
  returnObj.EventClassID = obj.c_whojoin
    ? whojoin_class.value[obj.c_whojoin]
    : null;

  return returnObj;
}

// route guard
onBeforeRouteLeave((to, from, next) => {
  if (edit.value) {
    $q.dialog({
      title: "是否確認離開本頁？",
      message: "所有未儲存的資料都會遺失！",
      persistent: true,
      cancel: true,
    })
      .onOk(() => {
        next();
      })
      .onCancel(() => {});
  } else {
    next();
  }
});
</script>
