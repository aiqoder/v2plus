import VueRouter from 'vue-router'

export default new VueRouter({
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: () => import('./pages/home.vue'),
      meta: {
        prev: null,
        next: { text: 'Table 表格', link: '/table' },
      },
    },
    {
      path: '/table',
      component: () => import('./pages/table/index.vue'),
      meta: {
        prev: { text: '快速开始', link: '/' },
        next: null,
      },
    },
  ],
})
