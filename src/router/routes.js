
const routes = [
  {
    path: '/',
    component: () => import('src/pages/Auth.vue'),
  },
  {
    path: '/test',
    component: () => import('src/pages/Test.vue'),
  },
  {
    path: '/bugs',
    component: () => import('src/pages/BugList.vue'),
  },
  {
    path: '/website',
    component: () => import('src/pages/Website/WebsiteHome.vue'), meta: { requiresAuth: true},
    children: [
      {
        path: 'news',
        component: () => import('src/pages/Website/NewsHome.vue'), meta: { requiresAuth: true},
        children: [
          {
            path: 'list',
            component: () => import('src/pages/Website/NewsList.vue'), meta: { requiresAuth: true},
          },
          {
            path: 'edit/:id',
            component: () => import('src/pages/Website/NewsEdit.vue'), meta: { requiresAuth: true},
          },
          {
            path: 'test-ckeditor',
            component: () => import('src/pages/Website/TestCKEditor.vue'), meta: { requiresAuth: true},
          },
        ]
      },

      {
        name: 'GalleryList',
        path: 'gallery',
        component: () => import('src/pages/GalleryHome.vue'), meta: { requiresAuth: true},
        children: [
          {
            name: 'GalleryList',
            path: "list",
            component: () => import("src/pages/Website/GalleryList.vue"), meta: { requiresAuth: true },
          },
          {
            name: 'GalleryEdit',
            path: "edit/:id",
            component: () => import("src/pages/Website/GalleryEdit.vue"), meta: { requiresAuth: true },
          },
        ]
      }
    ]
  },
  {
    path: '/healthcare',
    component: () => import('src/pages/HealthCareHome.vue'), meta: { requiresAuth: true},
    children: [
      {
        path: 'apply',
        component: () => import('src/pages/HealthCare/Apply.vue'), meta: { requiresAuth: true},
      },
      {
        path: 'balance',
        component: () => import('src/pages/HealthCare/Balance.vue'), meta: { requiresAuth: true},
      },
      {
        path: 'approve',
        component: () => import('src/pages/HealthCare/Approve.vue'), meta: { requiresAuth: true},
      }
    ]
  },

  {
    path: '/member',
    component: () => import('src/pages/MemberHome.vue'), meta: {requiresAuth: true},
    children: [
      {
        path: 'list',
        component: () => import('src/pages/Member/MemberList.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'add',
        component: () => import('src/pages/Member/MemberAdd.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'report',
        component: () => import('src/pages/Member/Report.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'log',
        component: () => import('src/pages/Member/LogViewer.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'admin',
        component: () => import('src/pages/Member/MemberAdmin.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'status',
        component: () => import('src/pages/Member/Status.vue'), meta: {requiresAuth: true},
      },
    ]
  },
  {
    path: '/volunteer',
    component: () => import('src/pages/VolunteerHome.vue'), meta: {requiresAuth: true},
    children: [
      {
        path: 'add',
        component: () => import('src/pages/Volunteer/VolunteerAdd.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'edit',
        component: () => import('src/pages/Volunteer/VolunteerEdit.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'report',
        component: () => import('src/pages/Volunteer/Report.vue'), meta: {requiresAuth: true},
      },
    ]
  },
  {
    path: '/event',
    component: () => import('src/pages/EventHome.vue'), meta: {requiresAuth: true},
    children: [
      {
        path: 'detail/:id',
        component: () => import('src/components/Event/EventDetail.vue'), meta: {requiresAuth: true},
        children: [
          {
            name: "EventContent",
            path: 'content',
            component: () => import('src/components/Event/EventContent.vue'), meta: {requiresAuth: true},
          },
          {
            name: "TakeAttendance",
            path: 'take-attendance',
            component: () => import('src/components/Event/AttendanceTake.vue'), meta: {requiresAuth: true},
          },
          {
            name: "AttendancePrint",
            path: 'attendance-print',
            component: () => import('src/components/Event/AttendancePrint.vue'), meta: {requiresAuth: true},
          },
        ]
      },
      {
        path: 'my-event',
        component: () => import('src/pages/Event/MyEvent.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'active',
        component: () => import('src/pages/Event/EventActiveList.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'search',
        component: () => import('src/pages/Event/EventSearch.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'batch-apply',
        component: () => import('src/pages/Event/EventBatchApply.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'add',
        component: () => import('src/pages/Event/AddEvent.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'report',
        component: () => import('src/pages/Event/Report.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'log',
        component: () => import('src/pages/Event/LogViewer.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'status',
        component: () => import('src/pages/Event/Status.vue'), meta: {requiresAuth: true},
      },
    ]
  },
  {
    path: '/duty',
    component: () => import('src/pages/DutyHome.vue'), meta: {requiresAuth: true},
    children: [
      {
        path: 'dutytable',
        component: () => import('src/pages/Duty/Dutytable.vue'), meta: {requiresAuth: true},
      },
      {
        path: 'activity',
        component: () => import('src/pages/Duty/Activity.vue'), meta: {requiresAuth: true}
      },
      {
        path: 'print',
        component: () => import('src/pages/Duty/Print.vue'), meta: {requiresAuth: true}
      },
    ]
  },
  {
    path: '/holiday',
    component: () => import('src/pages/HolidayHome.vue'), meta: {requiresAuth: true},
    children: [
      {  path: 'al-view',
      component: () => import('src/pages/Holiday/ALSummary.vue'), meta: {requiresAuth: true }},
      {  path: 'sal-view',
      component: () => import('src/pages/Holiday/SALSummary.vue'), meta: {requiresAuth: true}},
      {  path: 'al-apply',
      component: () => import('src/pages/Holiday/Apply.vue'), meta: {requiresAuth: true}},
      {  path: 'holiday-pending',
      component: () => import('src/pages/Holiday/Pending.vue'), meta: {requiresAuth: true}},
      {  path: 'holiday-approve',
      component: () => import('src/pages/Holiday/Approve.vue'), meta: {requiresAuth: true}},
      {  path: 'sl-report',
      component: () => import('src/pages/Holiday/SLSummary.vue'), meta: {requiresAuth: true}}
    ]
  },
  {
    path: '/overtime',
    component: () => import('src/pages/OvertimeHome.vue'), meta: {requiresAuth: true},
    children: [
      {  path: 'ot-view',
      component: () => import('src/pages/Overtime/OTSummary.vue'), meta: {requiresAuth: true }},
      {  path: 'ot-apply',
      component: () => import('src/pages/Overtime/Apply.vue'), meta: {requiresAuth: true}},
      {  path: 'ot-pending',
      component: () => import('src/pages/Overtime/Pending.vue'), meta: {requiresAuth: true}},
      {  path: 'ot-approve',
      component: () => import('src/pages/Overtime/Approve.vue'), meta: {requiresAuth: true}}
    ]
  },
  {
    path: '/user',
    name: 'UserManagement',
    component: () => import('src/pages/UserManagement.vue'), meta: { requiresAuth: true},
    children: [
      {  path: 'normal',
      component: () => import('src/pages/UserManagement/NormalStaff.vue'), meta: {requiresAuth: true }},
      {  path: 'temp',
      component: () => import('src/pages/UserManagement/TempStaff'), meta: {requiresAuth: true}}
    ]
  },
  {
    path: '/system-admin',
    name: 'SystemAdministrationView',
    component: () => import('src/pages/SystemAdmin.vue'), meta: { requiresAuth: true}
  },
  {
    path: '/account',
    component: () => import('src/pages/AccountHome.vue'), meta: {requiresAuth: true},
    children: [
      {
        path: 'other',
        component: () => import('src/pages/Account/OtherIncome.vue'), meta: {requiresAuth: true }
      },
      {
        path: 'receipt',
        component: () => import('src/pages/Account/ReceiptHome.vue'), meta: {requiresAuth: true },
        children: [
          {
            path: 'search',
            component: () => import('src/pages/Account/ReceiptSearch.vue'), meta: {requiresAuth: true }
          },
          {
            path: 'report',
            component: () => import('src/pages/Account/Report.vue'), meta: {requiresAuth: true }
          }
        ]
      },
      {
        path: 'inventory',
        component: () => import('src/pages/Account/InventoryHome.vue'), meta: {requiresAuth: true },
        children: [
          {
            path: 'add',
            component: () => import('src/pages/Account/InventoryAdd.vue'), meta: {requiresAuth: true }
          },
          {
            path: 'delete',
            component: () => import('src/pages/Account/InventoryDelete.vue'), meta: {requiresAuth: true }
          },
          {
            path: 'report',
            component: () => import('src/pages/Account/InventoryReport.vue'), meta: {requiresAuth: true }
          },
        ]
      },
      {
        path: 'log',
        component: () => import('src/pages/Account/LogViewer.vue'), meta: {requiresAuth: true},
      },
    ]
  },
    /*
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('src/pages/Auth.vue') },
      { path: '/home', component: () => import('src/pages/Home.vue'), meta: {requiresAuth: true} }
    ]
  },
  */
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
