/**
 * 虚拟滚动管理器
 *
 * 支持动态行高：通过渲染后实测行高来更新位置缓存，
 * 使用滚动锚定补偿机制避免因估计偏差导致的视觉跳动。
 *
 * 算法：
 * 1. 维护 rowHeights 缓存（已测行用实际值，未测行用估算值）
 * 2. 维护 rowPositions 数组（每行的 top/bottom 累积位置）
 * 3. 滚动时二分查找可见范围
 * 4. 渲染后 requestAnimationFrame 测量实际行高
 * 5. 高度变化时增量更新位置，锚定补偿修正 scrollTop
 */

/**
 * 二分查找：在位置数组中查找 scrollTop 所在的行索引
 * @param {Array<{index: number, top: number, bottom: number}>} positions
 * @param {number} scrollTop
 * @returns {number} 行索引
 */
function binarySearch(positions, scrollTop) {
  let low = 0
  let high = positions.length - 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const pos = positions[mid]
    if (pos.bottom <= scrollTop) {
      low = mid + 1
    } else if (pos.top > scrollTop) {
      high = mid - 1
    } else {
      return mid
    }
  }
  return Math.min(low, positions.length - 1)
}

export default class VirtualScrollManager {
  /**
   * @param {Object} options
   * @param {number} options.estimatedRowHeight - 估算行高（默认 48）
   * @param {number} options.overscan - 缓冲区行数（默认 5）
   */
  constructor(options = {}) {
    this.estimatedRowHeight = options.estimatedRowHeight || 48
    this.overscan = Math.max(0, options.overscan ?? 5)

    // 数据引用
    this.data = []

    // 行高缓存: Map<dataIndex, measuredHeight>
    this.rowHeights = new Map()

    // 位置数组: [{ index, top, bottom }]
    this.rowPositions = []

    // 总内容高度
    this.totalHeight = 0

    // 容器高度
    this.containerHeight = 0

    // 当前滚动位置
    this.scrollTop = 0

    // 当前可见范围
    this.visibleStart = 0
    this.visibleEnd = 0
    this.offsetTop = 0
    this.offsetBottom = 0

    // 展开行的额外高度缓存: Map<dataIndex, expandedHeight>
    this.expandedHeights = new Map()

    // 滚动锚定
    this.anchorIndex = 0
    this.anchorOffset = 0
  }

  /**
   * 获取指定行的当前高度（缓存优先，否则用估算值）
   * @param {number} index - 数据数组中的索引
   * @returns {number}
   */
  getRowHeight(index) {
    let h = this.rowHeights.get(index)
    if (h === undefined) {
      h = this.estimatedRowHeight
    }
    // 加上展开行高度
    const expandedH = this.expandedHeights.get(index) || 0
    return h + expandedH
  }

  /**
   * 设置全量数据
   * @param {Array} data
   */
  setData(data) {
    this.data = data || []
    this.rebuildPositions()
  }

  /**
   * 设置容器高度
   * @param {number} height
   */
  setContainerHeight(height) {
    if (this.containerHeight !== height) {
      this.containerHeight = height
      this.updateVisibleRange()
    }
  }

  /**
   * 更新滚动位置
   * @param {number} scrollTop
   * @returns {{ start: number, end: number, offsetTop: number, offsetBottom: number }|null}
   */
  setScrollTop(scrollTop) {
    if (this.rowPositions.length === 0) return null

    this.scrollTop = Math.max(0, scrollTop)
    this.updateVisibleRange()
    return this.getVisibleRange()
  }

  /**
   * 记录行高测量结果
   * @param {number} dataIndex - 数据数组中的索引
   * @param {number} height - 实测高度
   * @param {number} [expandedHeight] - 展开行内容高度（如有）
   * @returns {boolean} 是否发生了高度变化
   */
  measureRow(dataIndex, height, expandedHeight) {
    if (dataIndex < 0 || dataIndex >= this.data.length) return false

    const oldMainHeight = this.rowHeights.get(dataIndex)
    const oldExpanded = this.expandedHeights.get(dataIndex) || 0
    const newExpanded = expandedHeight || 0

    // 主行高度取整避免浮点抖动
    const roundedHeight = Math.round(height)

    if (oldMainHeight === roundedHeight && oldExpanded === newExpanded) {
      return false
    }

    this.rowHeights.set(dataIndex, roundedHeight)
    if (newExpanded > 0 || oldExpanded > 0) {
      this.expandedHeights.set(dataIndex, newExpanded)
    }

    // 增量更新位置（从变更行开始）
    this.updatePositionsFrom(dataIndex)
    return true
  }

  /**
   * 清除指定行的高度缓存（展开/折叠时调用）
   * @param {number} dataIndex
   */
  clearRowHeight(dataIndex) {
    this.rowHeights.delete(dataIndex)
    this.expandedHeights.delete(dataIndex)
    this.updatePositionsFrom(dataIndex)
  }

  /**
   * 全量重建位置数组
   */
  rebuildPositions() {
    this.rowPositions = []
    let top = 0

    for (let i = 0; i < this.data.length; i++) {
      const height = this.getRowHeight(i)
      this.rowPositions.push({ index: i, top, bottom: top + height })
      top += height
    }

    this.totalHeight = top
    this.updateVisibleRange()
  }

  /**
   * 从指定索引起增量更新位置
   * @param {number} fromIndex
   */
  updatePositionsFrom(fromIndex) {
    if (fromIndex >= this.rowPositions.length) {
      this.totalHeight = this.rowPositions.length > 0
        ? this.rowPositions[this.rowPositions.length - 1].bottom
        : 0
      this.updateVisibleRange()
      return
    }

    // 修正 fromIndex 之前的累计高度
    let top = fromIndex > 0 ? this.rowPositions[fromIndex - 1].bottom : 0

    for (let i = fromIndex; i < this.data.length; i++) {
      const height = this.getRowHeight(i)
      this.rowPositions[i] = { index: i, top, bottom: top + height }
      top += height
    }

    // 截断多余的位置记录（如果 data 变短了）
    if (this.rowPositions.length > this.data.length) {
      this.rowPositions.length = this.data.length
    }

    this.totalHeight = this.rowPositions.length > 0
      ? this.rowPositions[this.rowPositions.length - 1].bottom
      : 0

    // 滚动锚定补偿：
    // 如果当前有锚点，确保锚定行仍在相同相对位置
    if (this.anchorIndex >= 0 && this.anchorIndex < this.rowPositions.length) {
      const anchorPos = this.rowPositions[this.anchorIndex]
      const expectedScrollTop = anchorPos.top + this.anchorOffset
      if (Math.abs(expectedScrollTop - this.scrollTop) > 1) {
        this.scrollTop = Math.max(0, Math.min(expectedScrollTop, this.totalHeight - this.containerHeight))
      }
    }

    this.updateVisibleRange()
  }

  /**
   * 计算可见行范围
   */
  updateVisibleRange() {
    if (this.rowPositions.length === 0 || this.containerHeight <= 0) {
      this.visibleStart = 0
      this.visibleEnd = 0
      this.offsetTop = 0
      this.offsetBottom = 0
      return
    }

    const bufferTop = Math.max(0, this.scrollTop)
    const bufferBottom = bufferTop + this.containerHeight

    // 二分查找可见范围
    const firstVisible = binarySearch(this.rowPositions, bufferTop)
    const lastVisible = binarySearch(this.rowPositions, bufferBottom)

    // 加上 overscan 缓冲区
    this.visibleStart = Math.max(0, firstVisible - this.overscan)
    this.visibleEnd = Math.min(this.data.length, lastVisible + this.overscan + 1)

    // 计算偏移量
    if (this.visibleStart < this.rowPositions.length) {
      this.offsetTop = this.rowPositions[this.visibleStart].top
    } else {
      this.offsetTop = 0
    }

    if (this.visibleEnd < this.rowPositions.length) {
      this.offsetBottom = this.totalHeight - this.rowPositions[this.visibleEnd].top
    } else {
      this.offsetBottom = 0
    }
  }

  /**
   * 获取当前可见范围
   * @returns {{ start: number, end: number, offsetTop: number, offsetBottom: number, visibleData: Array }}
   */
  getVisibleRange() {
    return {
      start: this.visibleStart,
      end: this.visibleEnd,
      offsetTop: this.offsetTop,
      offsetBottom: this.offsetBottom,
      visibleData: this.data.slice(this.visibleStart, this.visibleEnd),
    }
  }

  /**
   * 查找 scrollTop 对应的行索引（二分查找）
   * @param {number} scrollTop
   * @returns {number}
   */
  findRowAtOffset(scrollTop) {
    if (this.rowPositions.length === 0) return 0
    return binarySearch(this.rowPositions, scrollTop)
  }

  /**
   * 获取指定行在数据数组中的 top 位置
   * @param {number} dataIndex
   * @returns {number}
   */
  getRowTop(dataIndex) {
    if (dataIndex < 0 || dataIndex >= this.rowPositions.length) return 0
    return this.rowPositions[dataIndex].top
  }

  /**
   * 设置锚点（在高度可能变化前调用）
   * @param {number} dataIndex
   */
  setAnchor(dataIndex) {
    if (dataIndex >= 0 && dataIndex < this.rowPositions.length) {
      this.anchorIndex = dataIndex
      this.anchorOffset = this.scrollTop - this.rowPositions[dataIndex].top
    }
  }

  /**
   * 销毁
   */
  destroy() {
    this.data = []
    this.rowHeights.clear()
    this.expandedHeights.clear()
    this.rowPositions = []
    this.totalHeight = 0
  }
}
