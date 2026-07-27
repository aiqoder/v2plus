<template>
  <div class="page">
    <h1 id="dialog">Dialog 弹窗</h1>
    <p>基于 Element UI <code>el-dialog</code> 二次封装，支持拖拽移动、八向缩放、双击全屏的高性能弹窗组件，兼容 el-dialog 所有原生 API。</p>

    <!-- ==================== 基础用法 ==================== -->
    <h2 id="basic">基础用法</h2>
    <p>使用 <code>visible.sync</code> 控制显隐，<code>title</code> 设置标题。默认内容通过默认插槽传入。</p>
    <code-preview :source="basicSource" :demo="BasicDialog" />

    <!-- ==================== 拖拽 + 缩放 ==================== -->
    <h2 id="draggable-resizable">拖拽 &amp; 缩放</h2>
    <p>默认开启 <code>draggable</code>（拖拽标题栏移动）和 <code>resizable</code>（八向缩放手柄）。可通过 <code>min-width</code> / <code>min-height</code> 限制最小尺寸。</p>
    <code-preview :source="draggableSource" :demo="DraggableResizableDialog" />

    <!-- ==================== 全屏 ==================== -->
    <h2 id="fullscreen">全屏切换</h2>
    <p>设置 <code>fullscreen</code> 显示全屏按钮（关闭按钮左侧）。设置 <code>dblclick-fullscreen</code> 支持双击缩放手柄沿该方向铺满。</p>
    <code-preview :source="fullscreenSource" :demo="FullscreenDialog" />

    <!-- ==================== 容器挂载 ==================== -->
    <h2 id="append-to">容器挂载</h2>
    <p>通过 <code>append-to</code> 指定 CSS 选择器，可将弹窗和遮罩挂载到自定义容器内（常用于弹窗嵌套或局部遮罩场景）。</p>
    <code-preview :source="containerSource" :demo="ContainerDialog" />

    <!-- ==================== API ==================== -->
    <h2 id="api">API</h2>
    <api-table id="dlg-attrs" title="Dialog Attributes" :headers="propHeaders" :data="attributes" />
    <api-table id="dlg-events" title="Dialog Events" :headers="eventHeaders" :data="events" />
    <api-table id="dlg-slots" title="Dialog Slots" :headers="slotHeaders" :data="slots" />
  </div>
</template>

<script>
import CodePreview from '../../components/CodePreview.vue'
import ApiTable from '../../components/ApiTable.vue'

import BasicDialog from './demos/BasicDialog.vue'
import basicSource from './demos/BasicDialog.vue?raw'

import DraggableResizableDialog from './demos/DraggableResizableDialog.vue'
import draggableSource from './demos/DraggableResizableDialog.vue?raw'

import FullscreenDialog from './demos/FullscreenDialog.vue'
import fullscreenSource from './demos/FullscreenDialog.vue?raw'

import ContainerDialog from './demos/ContainerDialog.vue'
import containerSource from './demos/ContainerDialog.vue?raw'

export default {
  components: { CodePreview, ApiTable },
  data() {
    return {
      BasicDialog,
      DraggableResizableDialog,
      FullscreenDialog,
      ContainerDialog,
      basicSource,
      draggableSource,
      fullscreenSource,
      containerSource,

      propHeaders: ['名称', '说明', '类型', '默认值'],
      eventHeaders: ['名称', '说明', '参数'],
      slotHeaders: ['名称', '说明', '作用域'],

      attributes: [
        { '名称': 'visible / v-model', '说明': '是否显示弹窗，支持 .sync 修饰符', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'title', '说明': '弹窗标题', '类型': 'string', '默认值': '""' },
        { '名称': 'width', '说明': '弹窗宽度', '类型': 'number / string', '默认值': '—' },
        { '名称': 'height', '说明': '弹窗高度（设置后 body 区域自动计算）', '类型': 'number / string', '默认值': '—' },
        { '名称': 'min-width', '说明': '缩放最小宽度', '类型': 'number / string', '默认值': '300' },
        { '名称': 'min-height', '说明': '缩放最小高度', '类型': 'number / string', '默认值': '200' },
        { '名称': 'z-index', '说明': '自定义 z-index', '类型': 'number / string', '默认值': '—' },
        { '名称': 'draggable', '说明': '是否可拖拽移动', '类型': 'boolean', '默认值': 'true' },
        { '名称': 'resizable', '说明': '是否可八向缩放', '类型': 'boolean', '默认值': 'true' },
        { '名称': 'dblclick-fullscreen', '说明': '双击缩放手柄是否沿方向铺满', '类型': 'boolean', '默认值': 'true' },
        { '名称': 'fullscreen', '说明': '是否显示全屏 / 还原按钮', '类型': 'boolean', '默认值': 'true' },
        { '名称': 'append-to', '说明': '弹窗挂载容器选择器（可选；用于局部遮罩场景）', '类型': 'string', '默认值': '—' },
        { '名称': 'close-on-click-modal', '说明': '点击遮罩是否关闭', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'close-on-press-escape', '说明': '按 ESC 是否关闭', '类型': 'boolean', '默认值': 'true' },
        { '名称': 'show-close', '说明': '是否显示关闭按钮', '类型': 'boolean', '默认值': 'true' },
        { '名称': 'center', '说明': '标题与底部是否居中', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'append-to-body', '说明': '是否挂载到 body', '类型': 'boolean', '默认值': 'true' },
        { '名称': 'modal-append-to-body', '说明': '遮罩是否挂载到 body', '类型': 'boolean', '默认值': 'true' },
        { '名称': 'lock-scroll', '说明': '弹窗出现时是否锁定 body 滚动', '类型': 'boolean', '默认值': 'true' },
        { '名称': 'destroy-on-close', '说明': '关闭时是否销毁 DOM', '类型': 'boolean', '默认值': 'true' },
        { '名称': 'before-close', '说明': '关闭前回调，接收 done 参数', '类型': 'function(done)', '默认值': '—' },
        { '名称': 'custom-class', '说明': '弹窗自定义类名', '类型': 'string', '默认值': '""' },
      ],

      events: [
        { '名称': 'update:visible', '说明': 'visible 改变时触发（支持 .sync）', '参数': '(visible)' },
        { '名称': 'open', '说明': '弹窗打开动画开始前', '参数': '—' },
        { '名称': 'opened', '说明': '弹窗打开动画结束后', '参数': '—' },
        { '名称': 'close', '说明': '弹窗关闭动画开始前', '参数': '—' },
        { '名称': 'closed', '说明': '弹窗关闭动画结束后', '参数': '—' },
      ],

      slots: [
        { '名称': 'default', '说明': '弹窗主体内容', '作用域': '—' },
        { '名称': 'title', '说明': '自定义标题区域', '作用域': '—' },
        { '名称': 'footer', '说明': '自定义底部按钮区域', '作用域': '—' },
      ],
    }
  },
}
</script>
