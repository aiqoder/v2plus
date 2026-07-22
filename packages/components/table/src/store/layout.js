/**
 * 布局计算模块
 * 负责列宽计算、固定列偏移、overflow 判断
 */
import { getScrollBarWidth } from '../../../../utils/scroll'

/**
 * 解析宽度值（number | string → number）
 */
export function parseWidth(val) {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const num = parseInt(val, 10)
    return isNaN(num) ? 0 : num
  }
  return 0
}

/**
 * 计算列宽
 *
 * 逻辑（对齐 Element Plus）：
 * 1. 有 `width` 的列 → 固定宽度（取 max(width, minWidth)）
 * 2. 只有 `min-width` 或无宽度的列 → 弹性列（最小 = minWidth || 80）
 * 3. remaining = containerWidth - 固定列宽之和
 * 4. 若 remaining >= 弹性列最小宽之和 → 按比例分配剩余空间
 * 5. 若 remaining < 弹性列最小宽之和 → 需要横向滚动
 *
 * @param {Array} columns - 列配置数组
 * @param {number} containerWidth - 容器宽度
 * @returns {{ tableWidth: number, needScrollX: boolean }}
 */
export function calcColumnWidths(columns, containerWidth) {
  if (!containerWidth || containerWidth <= 0) {
    // 容器宽未知时：所有列取最小宽度
    let total = 0
    columns.forEach((col) => {
      const w = parseWidth(col.width)
      const mw = parseWidth(col.minWidth)
      col.realWidth = Math.max(w, mw, col.type === 'selection' ? 50 : col.type === 'index' ? 50 : col.type === 'expand' ? 30 : 0) || 80
      total += col.realWidth
    })
    return { tableWidth: total, needScrollX: false }
  }

  // 特殊列默认最小宽度
  const TYPE_MIN_WIDTH = {
    selection: 50,
    index: 50,
    expand: 30,
  }

  let fixedTotal = 0   // 固定宽度列的总和
  let flexMinTotal = 0  // 弹性列最小宽度总和
  const flexCols = []   // 弹性列引用

  columns.forEach((col) => {
    const width = parseWidth(col.width)
    const minWidth = parseWidth(col.minWidth)
    const typeMin = TYPE_MIN_WIDTH[col.type] || 0

    if (width > 0) {
      // 有 width → 固定列
      const realWidth = Math.max(width, minWidth, typeMin)
      col.realWidth = realWidth
      fixedTotal += realWidth
    } else {
      // 无 width → 弹性列
      const flexMin = Math.max(minWidth, typeMin, 80)
      col.realWidth = flexMin
      flexMinTotal += flexMin
      flexCols.push(col)
    }
  })

  const remaining = containerWidth - fixedTotal
  const needScrollX = remaining < flexMinTotal

  // 计算最终表格宽度和弹性列实际宽度
  if (needScrollX) {
    // 弹性列取最小宽度，表格超出容器
    flexCols.forEach((col) => {
      col.realWidth = Math.max(
        parseWidth(col.minWidth),
        TYPE_MIN_WIDTH[col.type] || 0,
        80
      )
    })
    // 重新计算 flexMinTotal
    flexMinTotal = 0
    flexCols.forEach((col) => { flexMinTotal += col.realWidth })
  } else if (flexMinTotal > 0) {
    // 有剩余空间，按比例分配给弹性列
    const extraPerCol = (remaining - flexMinTotal) / flexCols.length
    flexCols.forEach((col) => {
      col.realWidth = Math.floor(col.realWidth + extraPerCol)
    })
    // 最后一个弹性列补足舍入误差
    if (flexCols.length > 0) {
      const currentFlexTotal = flexCols.reduce((sum, c) => sum + c.realWidth, 0)
      flexCols[flexCols.length - 1].realWidth += remaining - currentFlexTotal
    }
  }

  // tableWidth = 所有列实际宽度之和
  // 拖拽调整列宽后，表格总宽度正确反映各列实际宽度
  const totalWidth = columns.reduce((sum, col) => sum + (col.realWidth || 0), 0)

  // 当所有列都有固定宽度（无弹性列）时，如果总宽度超出容器则需要横向滚动
  const finalNeedScrollX = needScrollX || totalWidth > containerWidth

  return { tableWidth: totalWidth, needScrollX: finalNeedScrollX }
}

/**
 * 获取固定列 class
 */
export function getFixedClass(column) {
  if (!column.fixed) return ''
  if (column.fixed === true || column.fixed === 'left') return 'is-left-fixed'
  if (column.fixed === 'right') return 'is-right-fixed'
  return ''
}

/**
 * 计算固定列的 left/right sticky 偏移
 */
export function calcFixedOffset(columns) {
  let leftOffset = 0
  let rightOffset = 0

  // 从左到右计算 left-fixed 列的 left 偏移
  columns.forEach((col) => {
    if (col.fixed === true || col.fixed === 'left') {
      col.fixedLeft = leftOffset
      leftOffset += (col.realWidth || 80)
    }
  })

  // 从右到左计算 right-fixed 列的 right 偏移
  for (let i = columns.length - 1; i >= 0; i--) {
    const col = columns[i]
    if (col.fixed === 'right') {
      col.fixedRight = rightOffset
      rightOffset += (col.realWidth || 80)
    }
  }
}

/**
 * 获取滚动条宽度（带缓存）
 */
let _scrollBarWidth = null
export function getGutterWidth() {
  if (_scrollBarWidth === null) {
    _scrollBarWidth = getScrollBarWidth()
  }
  return _scrollBarWidth
}
