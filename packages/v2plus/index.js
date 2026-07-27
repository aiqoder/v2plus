/**
 * V2Plus — Vue 2 组件库主入口
 * 兼容 Element Plus API，支持按需引入
 */
import { version } from './version'
import { V2Table, V2TableColumn, V2TreeSelect, V2Dialog } from '../components'

// 全量样式（构建时提取为 v2plus.css）
import '../theme-chalk/src/index.scss'

// 全部组件列表 — 添加新组件时在此注册
const components = [
  V2Table,
  V2TableColumn,
  V2TreeSelect,
  V2Dialog,
]

// 批量注册所有组件
const install = function (Vue) {
  components.forEach((component) => {
    Vue.component(component.name, component)
  })
}

// 自动注册（通过 script 标签引入）
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export {
  version,
  install,
  V2Table,
  V2TableColumn,
  V2TreeSelect,
  V2Dialog,
}

export default {
  version,
  install,
  V2Table,
  V2TableColumn,
  V2TreeSelect,
  V2Dialog,
}
