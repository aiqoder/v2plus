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
        next: { text: 'TreeSelect 树形选择器', link: '/tree-select' },
      },
    },
    {
      path: '/tree-select',
      component: () => import('./pages/tree-select/index.vue'),
      meta: {
        prev: { text: 'Table 表格', link: '/table' },
        next: { text: 'Dialog 弹窗', link: '/dialog' },
      },
    },
    {
      path: '/dialog',
      component: () => import('./pages/dialog/index.vue'),
      meta: {
        prev: { text: 'TreeSelect 树形选择器', link: '/tree-select' },
        next: null,
      },
    },
  ],
})
