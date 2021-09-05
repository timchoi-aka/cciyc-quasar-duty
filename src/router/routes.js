
const routes = [
  {
    path: '/login',
    component: () => import('src/pages/Auth.vue'),
  },
  {
    path: '/',
    component: () => import('src/pages/Home.vue'), meta: {requiresAuth: true}
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
    path: '/al-view',
    component: () => import('src/pages/AnnualLeaveSummary.vue'), meta: {requiresAuth: true}
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
