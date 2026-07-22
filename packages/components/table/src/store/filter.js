/**
 * 默认筛选方法
 */
export function defaultFilterMethod(value, row, column) {
  const prop = column.property || column.prop
  if (!prop) return true
  const rowValue = getNestedValue(row, prop)

  // 数组选中值，任一匹配即可
  if (Array.isArray(value)) {
    if (value.length === 0) return true
    return value.some((v) => String(rowValue) === String(v))
  }

  return String(rowValue) === String(value)
}

/**
 * 对数据进行筛选
 * @param {Array} data - 数据数组
 * @param {Array} columns - 列配置数组
 */
export function filterData(data, columns) {
  let result = [...data]

  columns.forEach((column) => {
    if (!column.filteredValue || column.filteredValue.length === 0) return

    const method = column.filterMethod || defaultFilterMethod
    result = result.filter((row) => method(column.filteredValue, row, column))
  })

  return result
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
