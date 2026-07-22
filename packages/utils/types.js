/**
 * 类型判断工具函数
 */

export function isString(val) {
  return typeof val === 'string'
}

export function isNumber(val) {
  return typeof val === 'number' && !isNaN(val)
}

export function isBoolean(val) {
  return typeof val === 'boolean'
}

export function isFunction(val) {
  return typeof val === 'function'
}

export function isObject(val) {
  return val !== null && typeof val === 'object'
}

export function isPlainObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

export function isArray(val) {
  return Array.isArray(val)
}

export function isUndefined(val) {
  return typeof val === 'undefined'
}

export function isNull(val) {
  return val === null
}

export function isEmpty(val) {
  if (val == null) return true
  if (typeof val === 'string' || Array.isArray(val)) return val.length === 0
  if (typeof val === 'object') return Object.keys(val).length === 0
  return false
}
