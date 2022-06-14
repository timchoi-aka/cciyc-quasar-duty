
const routes = [
  {
    path: '/',
    component: () => import('src/pages/Auth.vue'),
  },
  {
    path: '/duty',
    component: () => import('src/pages/Dutytable.vue'), meta: {requiresAuth: true}
  },
  {
    path: '/activity',
    component: () => import('src/pages/Activity.vue'), meta: {requiresAuth: true}
  },
  {
    path: '/print',
    component: () => import('src/pages/Print.vue'), meta: {requiresAuth: true}
  },
  {
    path: '/holiday',
    component: () => import('src/pages/Holiday.vue'), meta: {requiresAuth: true},
    children: [
      {  path: 'al-view',
      component: () => import('src/pages/ALSummary.vue'), meta: {requiresAuth: true }},
      {  path: 'sal-view',
      component: () => import('src/pages/SALSummary.vue'), meta: {requiresAuth: true}},
      {  path: 'al-apply',
      component: () => import('src/pages/ALApply.vue'), meta: {requiresAuth: true}},
      {  path: 'holiday-pending',
      component: () => import('src/pages/HolidayPending.vue'), meta: {requiresAuth: true}},
      {  path: 'holiday-approve',
      component: () => import('src/pages/HolidayApprove.vue'), meta: {requiresAuth: true}}
    ]
  },
  {
    path: '/user-management',
    name: 'UserManagementView',
    component: () => import('src/pages/UserManagementView.vue'), meta: { requiresAuth: true}
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
