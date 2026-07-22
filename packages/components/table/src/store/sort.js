/**
 * 默认排序方法
 */
export function defaultSortMethod(a, b) {
  if (a == null) return -1
  if (b == null) return 1

  const strA = String(a)
  const strB = String(b)

  // 数字比较
  const numA = Number(strA)
  const numB = Number(strB)
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB
  }

  // 字符串比较 (支持中文)
  return strA.localeCompare(strB, 'zh-CN')
}

/**
 * 对数据进行排序
 * @param {Array} data - 数据数组
 * @param {Object} sortState - { prop, order }
 * @param {Object} column - 列配置
 */
export function sortData(data, sortState, column) {
  if (!sortState.prop || !sortState.order) return data

  const prop = sortState.prop
  const order = sortState.order
  const method = column.sortMethod || defaultSortMethod

  const sorted = [...data]

  sorted.sort((a, b) => {
    const valA = getNestedValue(a, prop)
    const valB = getNestedValue(b, prop)
    const result = method(valA, valB)
    return order === 'ascending' ? result : -result
  })

  return sorted
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj, path) {
  if (!path) return obj
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let value = obj
  for (const key of keys) {
    if (value == null) return undefined
    value = value[key]
  }
  return value
}

/**
 * 获取排序图标 class
 */
export function getSortClass(column, sortState) {
  if (!column.sortable) return ''
  if (column.sortable === 'custom') return 'custom'

  if (sortState.prop === column.property || sortState.prop === column.prop) {
    return sortState.order || 'sortable'
  }
  return 'sortable'
}
