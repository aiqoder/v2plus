/**
 * V2Dialog 交互层 —— 拖拽 + 八向缩放 + 双击全屏 + 全屏按钮
 *
 * 纯 DOM 交互管理，不依赖 Vue 实例。通过工厂函数注入能力。
 * - 拖拽/缩放使用 requestAnimationFrame 合并写入，按下时仅读一次布局。
 * - 监听器随交互起止自动挂载/卸载；cleanup() 兜底清理。
 */

const RESIZE_HANDLES = [
  { dir: 'left',        cls: 'v2-dialog__rz--l',  cursor: 'ew-resize' },
  { dir: 'right',       cls: 'v2-dialog__rz--r',  cursor: 'ew-resize' },
  { dir: 'top',         cls: 'v2-dialog__rz--t',  cursor: 'ns-resize' },
  { dir: 'bottom',      cls: 'v2-dialog__rz--b',  cursor: 'ns-resize' },
  { dir: 'top-left',    cls: 'v2-dialog__rz--tl', cursor: 'nwse-resize' },
  { dir: 'top-right',   cls: 'v2-dialog__rz--tr', cursor: 'nesw-resize' },
  { dir: 'bottom-left', cls: 'v2-dialog__rz--bl', cursor: 'nesw-resize' },
  { dir: 'bottom-right',cls: 'v2-dialog__rz--br', cursor: 'nwse-resize' },
]

export function createInteraction(api) {
  const {
    getEl,           // () =>  .el-dialog DOM | null
    getContainerEl,  // () => 自定义容器 DOM | null
    getContainer,    // () => {width, height} — 容器/视口尺寸
    setSize,         // (el, width, height) => void
    minW,            // number
    minH,            // number
    isAbsolute,      // boolean — 是否挂在自定义容器
    fsState,         // { value: boolean } — 全屏状态引用
    prevState,       // { value: object | null } — 全屏前缓存
  } = api

  let handleEls = []
  let dragEntry = null
  let fsBtn = null
  let fsIcon = null

  // ========== 辅助 ==========

  function getElementPos(el) {
    const rect = el.getBoundingClientRect()
    const container = getContainerEl()
    if (container) {
      const cRect = container.getBoundingClientRect()
      return { left: rect.left - cRect.left, top: rect.top - cRect.top }
    }
    return { left: rect.left, top: rect.top }
  }

  // ========== 拖拽 ==========

  function bindDrag() {
    const el = getEl()
    if (!el) return
    const header = el.querySelector('.el-dialog__header')
    if (!header) return

    header.style.cursor = 'move'

    function onDown(e) {
      // 点击 header 按钮（关闭/全屏）不触发拖拽
      if (e.target.closest('.el-dialog__headerbtn')) return
      e.preventDefault()

      const startX = e.clientX
      const startY = e.clientY
      const pos = getElementPos(el)
      const originLeft = pos.left
      const originTop = pos.top

      // 拖拽前归一化定位方式，清除 CSS 兜底的 transform
      el.style.position = isAbsolute ? 'absolute' : 'fixed'
      el.style.right = 'auto'
      el.style.margin = '0'
      el.style.transform = 'none'
      el.style.left = `${originLeft}px`
      el.style.top = `${originTop}px`

      let rafId = null
      let latest = null

      function apply() {
        rafId = null
        if (!latest) return
        let l = originLeft + latest.dx
        let t = originTop + latest.dy
        const container = getContainer()
        const w = el.offsetWidth
        const h = el.offsetHeight

        // 边界约束：默认不允许弹窗任何一边超出容器
        const minL = (w <= container.width) ? 0 : container.width - w
        const maxL = (w <= container.width) ? container.width - w : 0
        const maxT = (h <= container.height) ? container.height - h : 0
        l = Math.min(maxL, Math.max(minL, l))
        t = Math.min(maxT, Math.max(0, t))

        el.style.left = `${l}px`
        el.style.top = `${t}px`
      }

      function onMove(ev) {
        latest = { dx: ev.clientX - startX, dy: ev.clientY - startY }
        if (rafId == null) rafId = requestAnimationFrame(apply)
      }

      function onUp() {
        if (rafId != null) {
          cancelAnimationFrame(rafId)
          rafId = null
        }
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }

    header.addEventListener('mousedown', onDown)
    dragEntry = { header, onDown }
  }

  // ========== 缩放 ==========

  function startResize(e, dir) {
    const el = getEl()
    if (!el) return
    e.preventDefault()

    const pos = getElementPos(el)
    // 缩放前归一化定位方式
    el.style.position = isAbsolute ? 'absolute' : 'fixed'
    el.style.right = 'auto'
    el.style.margin = '0'
    el.style.transform = 'none'
    el.style.left = `${pos.left}px`
    el.style.top = `${pos.top}px`

    const start = {
      x: e.clientX,
      y: e.clientY,
      left: pos.left,
      top: pos.top,
      width: el.offsetWidth,
      height: el.offsetHeight,
    }
    const container = getContainer()

    let rafId = null
    let latest = null

    function apply() {
      rafId = null
      if (!latest) return
      const { dx, dy } = latest
      let { left, top, width, height } = start

      if (dir.includes('right')) {
        width = start.width + dx
        const maxW = container.width - start.left
        if (width > maxW) width = maxW
      }
      if (dir.includes('left')) {
        width = start.width - dx
        left = start.left + dx
        if (left < 0) { width = start.width + start.left; left = 0 }
      }
      if (dir.includes('bottom')) {
        height = start.height + dy
        const maxH = container.height - start.top
        if (height > maxH) height = maxH
      }
      if (dir.includes('top')) {
        height = start.height - dy
        top = start.top + dy
        if (top < 0) { height = start.height + start.top; top = 0 }
      }

      // 最小尺寸约束
      if (width < minW) {
        if (dir.includes('left')) left = start.left + (start.width - minW)
        width = minW
      }
      if (height < minH) {
        if (dir.includes('top')) top = start.top + (start.height - minH)
        height = minH
      }

      el.style.left = `${left}px`
      el.style.top = `${top}px`
      setSize(el, width, height)
    }

    function onMove(ev) {
      latest = { dx: ev.clientX - start.x, dy: ev.clientY - start.y }
      if (rafId == null) rafId = requestAnimationFrame(apply)
    }

    function onUp() {
      if (rafId != null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ========== 双击铺满 ==========

  function fillDirection(dir) {
    const el = getEl()
    if (!el) return
    const container = getContainer()
    if (dir.includes('left') || dir.includes('right')) {
      const h = el.offsetHeight
      el.style.left = '0px'
      setSize(el, container.width, h)
    } else {
      const w = el.offsetWidth
      el.style.top = '0px'
      setSize(el, w, container.height - 8)
    }
  }

  // ========== 手柄挂载 ==========

  function mountHandles(dblclickFS) {
    const el = getEl()
    if (!el) return
    RESIZE_HANDLES.forEach(({ dir, cls, cursor }) => {
      const h = document.createElement('div')
      h.className = `v2-dialog__rz ${cls}`
      h.style.cursor = cursor
      h.addEventListener('mousedown', (e) => startResize(e, dir))
      if (dblclickFS) {
        h.addEventListener('dblclick', () => fillDirection(dir))
      }
      el.appendChild(h)
      handleEls.push(h)
    })
  }

  // ========== 全屏按钮 ==========

  function updateFullscreenIcon() {
    if (!fsIcon) return
    if (fsState.value) {
      fsIcon.classList.remove('el-icon-full-screen')
      fsIcon.classList.add('el-icon-crop')
      fsBtn.title = '还原'
    } else {
      fsIcon.classList.remove('el-icon-crop')
      fsIcon.classList.add('el-icon-full-screen')
      fsBtn.title = '全屏'
    }
  }

  function mountFullscreenBtn() {
    const el = getEl()
    const header = el ? el.querySelector('.el-dialog__header') : null
    if (!el || !header) return

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'el-dialog__headerbtn v2-dialog__fullscreen'
    btn.setAttribute('aria-label', 'fullscreen')
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      toggleFullscreen()
    })

    const icon = document.createElement('i')
    icon.className = 'el-dialog__close el-icon el-icon-full-screen'
    btn.appendChild(icon)
    fsIcon = icon

    // 插入到关闭按钮左侧
    const closeBtn = header.querySelector('.el-dialog__headerbtn')
    if (closeBtn) {
      header.insertBefore(btn, closeBtn)
    } else {
      header.appendChild(btn)
    }

    fsBtn = btn
    updateFullscreenIcon()
  }

  // ========== 全屏切换 ==========

  function toggleFullscreen() {
    const el = getEl()
    if (!el) return

    if (!fsState.value) {
      // 进入全屏：缓存当前位置/尺寸
      const pos = getElementPos(el)
      prevState.value = {
        left: pos.left,
        top: pos.top,
        width: el.offsetWidth,
        height: el.offsetHeight,
      }
      const container = getContainer()
      el.style.left = '0px'
      el.style.top = '0px'
      el.style.right = 'auto'
      el.style.margin = '0'
      el.style.transform = 'none'
      setSize(el, container.width, container.height)
      fsState.value = true
    } else {
      // 还原
      const p = prevState.value
      if (p) {
        el.style.left = `${p.left}px`
        el.style.top = `${p.top}px`
        setSize(el, p.width, p.height)
      }
      fsState.value = false
      prevState.value = null
    }
    updateFullscreenIcon()
  }

  // ========== 清理 ==========

  function cleanup() {
    // handles
    handleEls.forEach((h) => {
      if (h.parentNode) h.parentNode.removeChild(h)
    })
    handleEls = []

    // fullscreen button
    if (fsBtn && fsBtn.parentNode) {
      fsBtn.parentNode.removeChild(fsBtn)
    }
    fsBtn = null
    fsIcon = null

    // drag
    if (dragEntry) {
      dragEntry.header.removeEventListener('mousedown', dragEntry.onDown)
      dragEntry = null
    }
  }

  return {
    bindDrag,
    mountHandles,
    mountFullscreenBtn,
    toggleFullscreen,
    cleanup,
  }
}
