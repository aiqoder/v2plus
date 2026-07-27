/**
 * 溢出 Tooltip 管理器
 * 当单元格内容溢出时（scrollWidth > clientWidth），显示 tooltip
 * 支持 dark/light 主题、自定义 tooltipFormatter
 *
 * 用法：在单元格 mouseenter/mouseleave 时调用 show/hide
 */

let tooltipEl = null
let arrowEl = null
let visible = false
let hideTimer = null

/**
 * 创建或复用 tooltip DOM 元素
 */
function ensureTooltipEl() {
  if (tooltipEl) return
  tooltipEl = document.createElement('div')
  tooltipEl.className = 'v2-table__overflow-tooltip v2-table__overflow-tooltip--dark'
  // 文本内容节点（放在箭头之前，firstChild 为文本元素）
  const contentEl = document.createElement('span')
  contentEl.className = 'v2-table__overflow-tooltip-content'
  tooltipEl.appendChild(contentEl)
  // 箭头
  arrowEl = document.createElement('div')
  arrowEl.className = 'v2-table__overflow-tooltip-arrow'
  tooltipEl.appendChild(arrowEl)
  document.body.appendChild(tooltipEl)

  // 全局 mousemove 监听，鼠标不在任何溢出单元格时隐藏
  document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true })
}

let currentCell = null

function handleGlobalMouseMove(e) {
  if (!currentCell || !visible) return
  // 检查鼠标是否仍在当前单元格内
  if (!currentCell.contains(e.target)) {
    hide()
  }
}

/**
 * 检查单元格内容是否溢出
 */
function isOverflow(el) {
  if (!el) return false
  // 获取文本内容容器（.v2-table__cell-inner）
  const inner = el.querySelector('.v2-table__cell-inner') || el
  return inner.scrollWidth > inner.clientWidth
}

/**
 * 获取 tooltip 内容
 */
function getTooltipContent(cellEl, col, row) {
  if (col.tooltipFormatter && typeof col.tooltipFormatter === 'function') {
    return col.tooltipFormatter(row, col, cellEl.textContent.trim())
  }
  return cellEl.textContent.trim()
}

/**
 * 显示 tooltip
 * @param {HTMLElement} cellEl - 单元格 DOM 元素
 * @param {Object} col - 列配置
 * @param {Object} row - 行数据
 * @param {Object} options - 配置 { effect: 'dark'|'light', placement: 'top'|'bottom' }
 */
export function showTooltip(cellEl, col, row, options = {}) {
  if (!cellEl) return
  if (!isOverflow(cellEl)) return

  ensureTooltipEl()
  clearTimeout(hideTimer)
  currentCell = cellEl

  const effect = options.effect || col.tooltipEffect || 'dark'
  const content = getTooltipContent(cellEl, col, row)
  if (!content) return

  // 更新主题
  tooltipEl.className = `v2-table__overflow-tooltip v2-table__overflow-tooltip--${effect} is-visible`
  // 文本内容设置在 content span 上（firstChild），而非 arrow div
  tooltipEl.firstChild.textContent = content

  // 设置 placement
  const placement = options.placement || 'top'
  tooltipEl.setAttribute('data-placement', placement)

  // 定位 tooltip
  positionTooltip(cellEl, placement)

  visible = true
}

/**
 * 隐藏 tooltip
 */
export function hideTooltip() {
  if (!tooltipEl || !visible) return
  visible = false
  currentCell = null
  hideTimer = setTimeout(() => {
    if (tooltipEl) {
      tooltipEl.classList.remove('is-visible')
    }
  }, 100)
}

/**
 * 定位 tooltip 到目标元素上方/下方
 */
function positionTooltip(target, placement) {
  if (!tooltipEl || !target) return

  const targetRect = target.getBoundingClientRect()
  const tooltipRect = tooltipEl.getBoundingClientRect()

  let top, left

  if (placement === 'top') {
    top = targetRect.top - tooltipRect.height - 8
    left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
  } else {
    // bottom
    top = targetRect.bottom + 8
    left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
  }

  // 边界修正
  if (left < 8) left = 8
  if (left + tooltipRect.width > window.innerWidth - 8) {
    left = window.innerWidth - tooltipRect.width - 8
  }
  if (top < 8) top = targetRect.bottom + 8
  if (top + tooltipRect.height > window.innerHeight - 8) {
    top = targetRect.top - tooltipRect.height - 8
  }

  tooltipEl.style.top = top + 'px'
  tooltipEl.style.left = left + 'px'
}

/**
 * 销毁 tooltip DOM
 */
export function destroyTooltip() {
  if (tooltipEl && tooltipEl.parentNode) {
    tooltipEl.parentNode.removeChild(tooltipEl)
  }
  tooltipEl = null
  arrowEl = null
  visible = false
  currentCell = null
  document.removeEventListener('mousemove', handleGlobalMouseMove)
}
