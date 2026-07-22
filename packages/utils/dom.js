/**
 * 判断是否有指定 class
 */
export function hasClass(el, cls) {
  if (!el || !cls) return false
  return el.className && el.className.match(new RegExp(`(\\s|^)${cls}(\\s|$)`))
}

/**
 * 添加 class
 */
export function addClass(el, cls) {
  if (!el || !cls) return
  if (!hasClass(el, cls)) {
    el.className = el.className ? `${el.className} ${cls}` : cls
  }
}

/**
 * 移除 class
 */
export function removeClass(el, cls) {
  if (!el || !cls) return
  if (hasClass(el, cls)) {
    el.className = el.className.replace(new RegExp(`(\\s|^)${cls}(\\s|$)`, 'g'), ' ').trim()
  }
}

/**
 * 监听过渡事件结束
 */
export function onTransitionEnd(el, callback) {
  const handler = (e) => {
    el.removeEventListener('transitionend', handler)
    callback(e)
  }
  el.addEventListener('transitionend', handler)
}

/**
 * 获取元素相对于文档的偏移
 */
export function getOffset(el) {
  const rect = el.getBoundingClientRect()
  return {
    top: rect.top + (window.pageYOffset || document.documentElement.scrollTop),
    left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft),
  }
}
