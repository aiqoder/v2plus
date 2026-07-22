/**
 * 获取滚动条宽度
 */
let scrollBarWidth = null

export function getScrollBarWidth() {
  if (scrollBarWidth !== null) return scrollBarWidth

  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.width = '100px'
  outer.style.position = 'absolute'
  outer.style.top = '-9999px'
  document.body.appendChild(outer)

  const widthNoScroll = outer.offsetWidth
  outer.style.overflow = 'scroll'

  const inner = document.createElement('div')
  inner.style.width = '100%'
  outer.appendChild(inner)

  const widthWithScroll = inner.offsetWidth
  outer.parentNode.removeChild(outer)
  scrollBarWidth = widthNoScroll - widthWithScroll
  return scrollBarWidth
}

/**
 * 获取目标元素的滚动容器
 */
export function getScrollContainer(el, vertical) {
  let parent = el
  while (parent) {
    if ([window, document, document.documentElement].includes(parent)) {
      return window
    }
    const overflow = getComputedStyle(parent)[vertical ? 'overflowY' : 'overflowX']
    if (overflow.match(/scroll|auto|overlay/)) {
      return parent
    }
    parent = parent.parentNode
  }
  return parent
}

/**
 * 是否在可见区域内 (用于虚拟滚动时可扩展)
 */
export function isInViewport(el, container) {
  const rect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  return (
    rect.top >= containerRect.top &&
    rect.bottom <= containerRect.bottom
  )
}
