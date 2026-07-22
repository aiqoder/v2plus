import Vue from 'vue'
import { sortData, getSortClass } from './sort'
import { filterData } from './filter'
import { calcColumnWidths, calcFixedOffset, getFixedClass, getGutterWidth } from './layout'

/**
 * Table 状态管理 Store
 * 使用 Vue.observable() 实现响应式状态
 */
export default class TableStore {
  constructor(table) {
    this.table = table

    // 响应式状态
    this.state = Vue.observable({
      // 原始数据
      data: [],

      // 列配置 (由 table-column 组件注册)
      columns: [],

      // 排序状态
      sortState: {
        prop: null,
        order: null,
      },

      // 选中状态
      selection: [],

      // 当前行 (单选)
      currentRow: null,

      // 展开行
      expandedRows: [],

      // 筛选状态 (按 columnKey 索引)
      filters: {},

      // 计算后的数据 (排序+筛选后)
      sortedData: [],

      // 布局
      tableWidth: 0,
      tableHeight: 0,
      bodyHeight: 0,
      isScrolling: false,
      scrollX: 0,
      scrollY: 0,
      needScrollX: false,
      gutterWidth: 0,

      // 固定列阴影
      leftFixedShadow: false,
      rightFixedShadow: false,

      // 表格是否可见
      isVisible: false,

      // 当前悬停行
      hoverRow: null,
    })

    // 非响应式属性
    // rowKey 不设默认值：未配置时 getRowKey 回退到行对象引用比较
    this.rowKey = table.rowKey || null
    this.defaultExpandAll = table.defaultExpandAll || false
    this.lazy = table.lazy || false
    this.load = table.load || null
    this.treeProps = table.treeProps || { hasChildren: 'hasChildren', children: 'children' }
    this.indent = table.indent || 16
    this.selectOnIndeterminate = table.selectOnIndeterminate !== false

    // 绑定方法
    this.commit = this.commit.bind(this)
    this.updateColumns = this.updateColumns.bind(this)
    this.updateData = this.updateData.bind(this)
    this.setCurrentRow = this.setCurrentRow.bind(this)
    this.toggleRowSelection = this.toggleRowSelection.bind(this)
    this.clearSelection = this.clearSelection.bind(this)
  }

  /**
   * 提交变更
   */
  commit(name, ...args) {
    const mutations = {
      updateColumns: this.updateColumns,
      updateData: this.updateData,
      setSort: this.setSort,
      setFilter: this.setFilter,
      setTableSize: this.setTableSize,
    }
    if (mutations[name]) {
      mutations[name](...args)
    }
  }

  /**
   * 注册/更新列配置
   */
  updateColumns(columns) {
    this.state.columns = columns.filter((col) => col && typeof col === 'object')
  }

  /**
   * 插入单列 (由 table-column mounted 调用)
   */
  insertColumn(column) {
    const existing = this.state.columns.find((c) => c.id === column.id)
    if (!existing) {
      this.state.columns.push(column)
    } else {
      Object.assign(existing, column)
    }
     this.state.columns = [...this.state.columns]
  }

  /**
   * 移除单列 (由 table-column destroyed 调用)
   */
  removeColumn(id) {
    this.state.columns = this.state.columns.filter((c) => c.id !== id)
  }

  /**
   * 更新数据
   */
  updateData(data) {
    const oldData = this.state.data
    this.state.data = data || []

    // reserveSelection: 保留之前选中的行
    if (this.table.reserveSelection !== false && this.state.selection.length > 0) {
      this.state.selection = this.state.selection.filter((selectedRow) => {
        return this.state.data.some((row) => this.getRowKey(row) === this.getRowKey(selectedRow))
      })
    }

    this.doFilterAndSort()
  }

  /**
   * 设置排序
   */
  setSort(prop, order) {
    if (this.state.sortState.prop === prop && this.state.sortState.order === order) {
      // 点击同一列同一排序状态，切换到下一个状态
      const orders = ['ascending', 'descending', null]
      const idx = orders.indexOf(order)
      const nextOrder = orders[(idx + 1) % 3]
      this.state.sortState = { prop: nextOrder ? prop : null, order: nextOrder }
    } else {
      this.state.sortState = { prop, order }
    }
    this.doFilterAndSort()
  }

  /**
   * 设置筛选
   */
  setFilter(columnKey, values) {
    this.state.filters = { ...this.state.filters, [columnKey]: values }

    // 更新对应列的 filteredValue
    const column = this.state.columns.find((c) => c.columnKey === columnKey)
    if (column) {
      column.filteredValue = values
    }

    this.doFilterAndSort()
  }

  /**
   * 清空排序
   */
  clearSort() {
    this.state.sortState = { prop: null, order: null }
    this.doFilterAndSort()
  }

  /**
   * 清空筛选
   */
  clearFilter(columnKeys) {
    if (columnKeys && columnKeys.length) {
      columnKeys.forEach((key) => {
        delete this.state.filters[key]
        const col = this.state.columns.find((c) => c.columnKey === key)
        if (col) col.filteredValue = []
      })
    } else {
      this.state.filters = {}
      this.state.columns.forEach((col) => { col.filteredValue = [] })
    }
    this.doFilterAndSort()
  }

  /**
   * 执行筛选+排序
   */
  doFilterAndSort() {
    let data = [...this.state.data]

    // 1. 筛选
    const columnsWithFilter = this.state.columns.filter(
      (col) => col.filteredValue && col.filteredValue.length > 0
    )
    if (columnsWithFilter.length > 0) {
      data = filterData(data, columnsWithFilter)
    }

    // 2. 排序
    if (this.state.sortState.prop && this.state.sortState.order) {
      const sortCol = this.state.columns.find(
        (c) => (c.property || c.prop) === this.state.sortState.prop
      )
      if (sortCol) {
        data = sortData(data, this.state.sortState, sortCol)
      }
    }

    this.state.sortedData = data
  }

  /**
   * 获取排序后的数据
   */
  getSortedData() {
    if (this.state.sortedData.length === 0 && this.state.data.length > 0) {
      return this.state.data
    }
    return this.state.sortedData
  }

  /**
   * 设置表格尺寸
   */
  setTableSize(width, height) {
    this.state.tableHeight = height

    // 使用新的 calcColumnWidths 计算列宽和是否需要横向滚动
    const { tableWidth, needScrollX } = calcColumnWidths(
      this.state.columns,
      width
    )
    calcFixedOffset(this.state.columns)

    // 计算 gutterWidth（竖向滚动条宽度）
    this.state.gutterWidth = this.state.scrollY
      ? getGutterWidth()
      : 0

    this.state.tableWidth = tableWidth
    this.state.needScrollX = needScrollX
  }

  /**
   * 切换行选中
   */
  toggleRowSelection(row, selected) {
    const key = this.getRowKey(row)
    const index = this.state.selection.findIndex(
      (r) => this.getRowKey(r) === key
    )
    const shouldSelect = typeof selected === 'boolean' ? selected : index === -1

    if (shouldSelect && index === -1) {
      this.state.selection.push(row)
    } else if (!shouldSelect && index !== -1) {
      this.state.selection.splice(index, 1)
    }
  }

  /**
   * 清空选中
   */
  clearSelection() {
    this.state.selection = []
  }

  /**
   * 获取选中的行
   */
  getSelectionRows() {
    return this.state.selection
  }

  /**
   * 切换全选
   */
  toggleAllSelection() {
    const data = this.getSortedData()
    if (this.state.selection.length === data.length) {
      this.state.selection = []
    } else {
      this.state.selection = [...data]
    }
  }

  /**
   * 设置当前行 (单选)
   */
  setCurrentRow(row) {
    const old = this.state.currentRow
    this.state.currentRow = row
    return old
  }

  /**
   * 切换行展开
   */
  toggleRowExpansion(row, expanded) {
    const key = this.getRowKey(row)
    const index = this.state.expandedRows.findIndex(
      (r) => this.getRowKey(r) === key
    )
    const shouldExpand = typeof expanded === 'boolean' ? expanded : index === -1

    if (shouldExpand && index === -1) {
      this.state.expandedRows.push(row)
    } else if (!shouldExpand && index !== -1) {
      this.state.expandedRows.splice(index, 1)
    }
  }

  /**
   * 获取行的 key
   * 当 rowKey 未配置或行数据中不存在对应字段时，回退到行对象引用
   */
  getRowKey(row) {
    if (typeof this.rowKey === 'function') {
      const key = this.rowKey(row)
      return key !== undefined ? key : row
    }
    if (this.rowKey && row[this.rowKey] !== undefined) {
      return row[this.rowKey]
    }
    // 回退：无有效 key 时使用行对象引用，保证 isRowExpanded/isRowSelected 等比较正常工作
    return row
  }

  /**
   * 行是否被选中
   */
  isRowSelected(row) {
    const key = this.getRowKey(row)
    return this.state.selection.some((r) => this.getRowKey(r) === key)
  }

  /**
   * 行是否展开
   */
  isRowExpanded(row) {
    const key = this.getRowKey(row)
    return this.state.expandedRows.some((r) => this.getRowKey(r) === key)
  }

  /**
   * 是否全选
   */
  isAllSelected() {
    const data = this.getSortedData()
    if (data.length === 0) return false
    return data.every((row) => this.isRowSelected(row))
  }

  /**
   * 是否半选
   */
  isIndeterminate() {
    const data = this.getSortedData()
    const selectedCount = data.filter((row) => this.isRowSelected(row)).length
    return selectedCount > 0 && selectedCount < data.length
  }

  /**
   * 获取列配置的排序 class
   */
  getSortClass(column) {
    return getSortClass(column, this.state.sortState)
  }

  /**
   * 获取固定列 class
   */
  getFixedClass(column) {
    return getFixedClass(column)
  }

  /**
   * 获取半选行（树形表格中部分子节点被选中的父行）
   */
  getHalfSelectionRows() {
    return []
  }

  /**
   * 更新 lazy tree 的子节点 key
   * @param {string} key - 父节点 key
   * @param {Array} children - 子节点数据
   */
  updateKeyChildren(key, children) {
    if (!this.lazy) return
    const findRow = (data, key) => {
      for (const row of data) {
        if (this.getRowKey(row) === key) return row
        if (row[this.treeProps.children]) {
          const found = findRow(row[this.treeProps.children], key)
          if (found) return found
        }
      }
      return null
    }
    const parent = findRow(this.state.data, key)
    if (parent) {
      this.table.$set(parent, this.treeProps.children, children)
      this.doFilterAndSort()
    }
  }

  /**
   * 设置当前悬停行
   */
  setHoverRow(row) {
    this.state.hoverRow = row
  }

  /**
   * 销毁
   */
  destroy() {
    this.state = null
  }
}
