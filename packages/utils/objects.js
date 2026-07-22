/**
 * 对象操作工具函数
 */

/**
 * 获取对象嵌套属性值
 * 支持 'a.b.c' 和 ['a', 'b', 'c'] 两种方式
 */
export function getPropByPath(obj, path, strict) {
  let tempObj = obj
  const keyArr = typeof path === 'string' ? path.replace(/\[(\d+)\]/g, '.$1').split('.') : path
  let i = 0
  for (let len = keyArr.length; i < len - 1; i++) {
    if (tempObj == null && strict) return { o: null, k: null, v: null }
    const key = keyArr[i]
    if (key in (tempObj || {})) {
      tempObj = tempObj[key]
    } else {
      if (strict) return { o: null, k: null, v: null }
      tempObj = undefined
    }
  }
  const finalKey = keyArr[i]
  return {
    o: tempObj,
    k: finalKey,
    v: tempObj ? tempObj[finalKey] : undefined,
  }
}

/**
 * 深度合并对象
 */
export function merge(target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()
  if (isPlainObject(target) && isPlainObject(source)) {
    for (const key in source) {
      if (isPlainObject(source[key])) {
        if (!target[key]) {
          target[key] = {}
        }
        merge(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
  }
  return merge(target, ...sources)
}

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * 合并 class 名称
 */
export function mergeClassName(a, b) {
  if (!a && !b) return ''
  if (!a) return b
  if (!b) return a
  if (typeof a === 'string' && typeof b === 'string') {
    return `${a} ${b}`
  }
  if (typeof a === 'function' && typeof b === 'function') {
    return function (...args) {
      const va = a.apply(this, args)
      const vb = b.apply(this, args)
      return `${va || ''} ${vb || ''}`.trim()
    }
  }
  if (typeof a === 'function') {
    return function (...args) {
      return `${a.apply(this, args)} ${b}`.trim()
    }
  }
  if (typeof b === 'function') {
    return function (...args) {
      return `${a} ${b.apply(this, args)}`.trim()
    }
  }
  return `${a} ${b}`
}
