
const routes = [
  {
    path: '/',
    component: () => import('src/pages/Auth.vue'),
  },
  {
    path: '/duty',
    component: () => import('src/pages/Duty.vue'), meta: {requiresAuth: true},
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
    component: () => import('src/pages/Holiday.vue'), meta: {requiresAuth: true},
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
      component: () => import('src/pages/Holiday/Approve.vue'), meta: {requiresAuth: true}}
    ]
  },
  {
    path: '/overtime',
    component: () => import('src/pages/Overtime.vue'), meta: {requiresAuth: true},
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
