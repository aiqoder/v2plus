<template>
  <el-dialog
    ref="dialog"
    :visible.sync="innerVisible"
    :title="title"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :center="center"
    :top="dialogTop"
    :custom-class="dialogClass"
    :append-to-body="appendToBody"
    :modal-append-to-body="modalAppendToBody"
    :lock-scroll="lockScroll"
    :before-close="handleBeforeClose"
    :destroy-on-close="destroyOnClose"
    :width="dialogWidth"
    v-bind="forwardAttrs"
    v-on="forwardListeners"
    @open="onOpen"
    @opened="onOpened"
    @close="onClose"
    @closed="onClosed"
  >
    <template v-if="$slots.title" #title>
      <slot name="title"></slot>
    </template>
    <slot></slot>
    <template v-if="$slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </el-dialog>
</template>

<script>
import { createInteraction } from './use-resizable'

/**
 * V2Dialog — 可拖拽 + 八向缩放 + 双击全屏的高性能弹窗组件
 *
 * 基于 element-ui el-dialog 封装，兼容其所有 API（props/events/slots）。
 * 交互逻辑委托给 use-resizable.js 纯 DOM 层管理。
 */

function toPx(val, fallback) {
  if (val == null || val === '') return fallback
  const n = typeof val === 'number' ? val : parseInt(String(val).replace('px', ''), 10)
  return Number.isFinite(n) ? n : fallback
}

export default {
  name: 'V2Dialog',

  inheritAttrs: false,

  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '' },
    closeOnClickModal: { type: Boolean, default: false },
    closeOnPressEscape: { type: Boolean, default: true },
    showClose: { type: Boolean, default: true },
    center: { type: Boolean, default: false },
    appendToBody: { type: Boolean, default: true },
    modalAppendToBody: { type: Boolean, default: true },
    lockScroll: { type: Boolean, default: true },
    destroyOnClose: { type: Boolean, default: true },
    beforeClose: { type: Function, default: null },
    customClass: { type: String, default: '' },

    width: { type: [Number, String], default: null },
    height: { type: [Number, String], default: null },
    minWidth: { type: [Number, String], default: 300 },
    minHeight: { type: [Number, String], default: 200 },

    zIndex: { type: [Number, String], default: null },

    draggable: { type: Boolean, default: true },
    resizable: { type: Boolean, default: true },
    dblclickFullscreen: { type: Boolean, default: true },
    fullscreen: { type: Boolean, default: true },

    /** 弹窗外层挂载到的容器（CSS 选择器） */
    appendTo: { type: String, default: null },
  },

  data() {
    return {
      innerVisible: this.visible,
      interaction: null,
    }
  },

  computed: {
    forwardAttrs() {
      const omitted = [
        'visible', 'z-index', 'min-width', 'min-height',
        'draggable', 'resizable', 'dblclick-fullscreen',
        'append-to',
      ]
      return Object.fromEntries(
        Object.entries(this.$attrs).filter(([k]) => !omitted.includes(k))
      )
    },
    forwardListeners() {
      const { open, opened, close, closed, ...rest } = this.$listeners
      return rest
    },
    resolvedAppendTo() {
      return this.appendTo || null
    },
    numericWidth() {
      return toPx(this.width, 0)
    },
    numericHeight() {
      return toPx(this.height, 0)
    },
    numericMinWidth() {
      return toPx(this.minWidth, 300)
    },
    numericMinHeight() {
      return toPx(this.minHeight, 200)
    },
    dialogWidth() {
      if (this.width == null || this.width === '') return null
      return typeof this.width === 'number' ? `${this.width}px` : this.width
    },
    dialogTop() {
      return '0px'
    },
    dialogClass() {
      return ['v2-dialog', this.resizable ? 'is-resizable' : '', this.customClass]
        .filter(Boolean)
        .join(' ')
    },
  },

  watch: {
    visible(val) {
      this.innerVisible = val
    },
    innerVisible(val) {
      this.$emit('update:visible', val)
    },
  },

  beforeDestroy() {
    this.cleanupInteraction()
  },

  methods: {
    // ========== DOM 查询 ==========

    getDialogEl() {
      const ref = this.$refs.dialog
      if (!ref) return null
      const root = ref.$el || ref
      return root.querySelector ? root.querySelector('.el-dialog') : null
    },

    getDialogWrapper() {
      const ref = this.$refs.dialog
      if (!ref) return null
      const root = ref.$el || ref
      return root.classList && root.classList.contains('el-dialog__wrapper')
        ? root
        : root.querySelector('.el-dialog__wrapper')
    },

    getContainerEl() {
      if (!this.resolvedAppendTo) return null
      return document.querySelector(this.resolvedAppendTo)
    },

    getContainerRect() {
      const c = this.getContainerEl()
      if (c) return { width: c.clientWidth, height: c.clientHeight }
      return { width: window.innerWidth, height: window.innerHeight }
    },

    // ========== 尺寸 & 定位 ==========

    setBoxSize(el, w, h) {
      el.style.width = `${w}px`
      el.style.height = `${h}px`
      const header = el.querySelector('.el-dialog__header')
      const footer = el.querySelector('.el-dialog__footer')
      const body = el.querySelector('.el-dialog__body')
      if (!body) return
      const hH = header ? header.offsetHeight : 0
      const fH = footer ? footer.offsetHeight : 0
      const padTop = parseInt(getComputedStyle(body).paddingTop, 10) || 0
      const padBottom = parseInt(getComputedStyle(body).paddingBottom, 10) || 0
      const bodyH = h - hH - fH - padTop - padBottom
      body.style.height = `${Math.max(bodyH, 60)}px`
      body.style.overflow = 'auto'
    },

    centerBox(el) {
      const container = this.getContainerRect()
      const w = el.offsetWidth
      const h = el.offsetHeight
      const left = Math.max(0, (container.width - w) / 2)
      const top = Math.max(0, (container.height - h) / 2 - 20)
      el.style.position = this.resolvedAppendTo ? 'absolute' : 'fixed'
      el.style.left = `${left}px`
      el.style.top = `${top}px`
      el.style.right = 'auto'
      el.style.margin = '0'
      el.style.transform = 'none'
    },

    // ========== 生命周期 ==========

    onOpen() {
      this.$nextTick(() => {
        this.moveToContainer()
        this.applyInitialStyle()
      })
      this.$emit('open')
    },

    onOpened() {
      this.$nextTick(() => {
        this.mountInteraction()
      })
      this.$emit('opened')
    },

    onClose() {
      this.$emit('close')
    },

    onClosed() {
      this.cleanupInteraction()
      this.$emit('closed')
    },

    handleBeforeClose(done) {
      if (typeof this.beforeClose === 'function') {
        this.beforeClose(done)
      } else {
        done()
      }
    },

    moveToContainer() {
      if (!this.resolvedAppendTo) return
      const container = this.getContainerEl()
      const wrapper = this.getDialogWrapper()
      if (!container || !wrapper) return
      if (wrapper.parentNode !== container) {
        container.appendChild(wrapper)
      }
      // 覆盖 Element UI 的 position:fixed，使弹窗和遮罩相对于容器定位
      wrapper.style.position = 'absolute'
      wrapper.style.top = '0'
      wrapper.style.right = '0'
      wrapper.style.bottom = '0'
      wrapper.style.left = '0'
      wrapper.style.overflow = 'hidden'
      const modal = wrapper.querySelector('.v-modal')
      if (modal) {
        modal.style.position = 'absolute'
      }
    },

    applyInitialStyle() {
      const el = this.getDialogEl()
      if (!el) return
      if (this.numericHeight > 0) {
        this.setBoxSize(
          el,
          this.numericWidth > 0 ? this.numericWidth : el.offsetWidth,
          this.numericHeight
        )
      } else if (this.numericWidth > 0) {
        el.style.width = `${this.numericWidth}px`
      }
      this.centerBox(el)
      if (this.zIndex != null && this.zIndex !== '') {
        el.style.zIndex = String(this.zIndex)
      }
    },

    // ========== 交互层挂载 / 清理 ==========

    mountInteraction() {
      const el = this.getDialogEl()
      if (!el) return

      // 可变引用，供 use-resizable 读写全屏状态
      const fsRef = { value: false }
      const prevRef = { value: null }

      this.interaction = createInteraction({
        getEl: () => this.getDialogEl(),
        getContainerEl: () => this.getContainerEl(),
        getContainer: () => this.getContainerRect(),
        setSize: (el, w, h) => this.setBoxSize(el, w, h),
        minW: this.numericMinWidth,
        minH: this.numericMinHeight,
        isAbsolute: !!this.resolvedAppendTo,
        fsState: fsRef,
        prevState: prevRef,
      })

      if (this.draggable) this.interaction.bindDrag()
      if (this.resizable) this.interaction.mountHandles(this.dblclickFullscreen)
      if (this.fullscreen) this.interaction.mountFullscreenBtn()
    },

    cleanupInteraction() {
      if (this.interaction) {
        this.interaction.cleanup()
        this.interaction = null
      }
    },
  },
}
</script>
