<template>
  <table
    ref="bodyTable"
    class="v2-table__body"
    cellspacing="0"
    cellpadding="0"
    border="0"
    :style="tableStyle"
  >
    <colgroup>
      <col v-for="col in columns" :key="col.id" :style="{ width: col.realWidth + 'px' }" />
    </colgroup>
    <tbody>
      <template v-if="data.length === 0">
        <tr class="v2-table__empty-row">
          <td :colspan="columns.length" class="v2-table__empty-text">
            <slot name="empty">{{ emptyText }}</slot>
          </td>
        </tr>
      </template>
      <template v-for="(row, rowIndex) in data">
        <!-- 主数据行 -->
        <tr
          :key="getRowKey(row) || rowIndex"
          class="v2-table__row"
          :class="rowClasses(row, rowIndex)"
          :style="rowStyles(row, rowIndex)"
          @click="handleRowClick(row, rowIndex, $event)"
          @dblclick="handleRowDblclick(row, rowIndex, $event)"
          @contextmenu="handleRowContextmenu(row, rowIndex, $event)"
          @mouseenter="handleRowMouseEnter(row, rowIndex, $event)"
          @mouseleave="handleRowMouseLeave(row, rowIndex, $event)"
        >
          <template v-for="(col, colIndex) in columns">
            <td
              v-if="!mergedCells || mergedCells[mergeKey(rowIndex, colIndex)] !== false"
              :key="col.id"
              v-bind="mergeAttrs(row, col, rowIndex, colIndex)"
              class="v2-table__cell"
              :class="cellClasses(col, rowIndex, colIndex)"
              :style="cellStyles(col, rowIndex, colIndex)"
              @click="handleCellClick(row, col, rowIndex, colIndex, $event)"
              @dblclick="handleCellDblclick(row, col, rowIndex, colIndex, $event)"
              @contextmenu="handleCellContextmenu(row, col, rowIndex, colIndex, $event)"
              @mouseenter="handleCellMouseEnter(row, col, rowIndex, colIndex, $event)"
              @mouseleave="handleCellMouseLeave(row, col, rowIndex, colIndex, $event)"
            >
              <div class="v2-table__cell-inner" :class="{ 'is-overflow': col.showOverflowTooltip }">
                <!-- 展开按钮 -->
                <span
                  v-if="col.type === 'expand'"
                  class="v2-table__expand-icon"
                  :class="{ 'is-expanded': store.isRowExpanded(row) }"
                  @click.stop="toggleRowExpansion(row)"
                >
                  <svg viewBox="0 0 16 16" width="12" height="12">
                    <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" />
                  </svg>
                </span>
                <!-- 多选框 -->
                <label v-else-if="col.type === 'selection'" class="v2-table__checkbox">
                  <input
                    type="checkbox"
                    :checked="store.isRowSelected(row)"
                    :disabled="col.selectable && !col.selectable(row, rowIndex)"
                    @change="handleSelectRow(row)"
                  />
                </label>
                <!-- 行序号 -->
                <span v-else-if="col.type === 'index'">
                  {{ getIndex(rowIndex) }}
                </span>
                <!-- 自定义渲染 (作用域插槽) -->
                <template v-else-if="col.renderCell">
                  <cell-renderer :render-fn="col.renderCell" :scope-data="getCellScope(row, col, rowIndex)" />
                </template>
                <!-- 格式化渲染 -->
                <template v-else-if="col.formatter">
                  {{ col.formatter(row, col, getCellValue(row, col), rowIndex) }}
                </template>
                <!-- 默认渲染 -->
                <template v-else>
                  {{ getCellValue(row, col) }}
                </template>
              </div>
            </td>
          </template>
        </tr>
        <!-- 展开行内容 -->
        <tr
          v-if="hasExpandColumn && store.isRowExpanded(row)"
          :key="getRowKey(row) + '_expand' || rowIndex + '_expand'"
          class="v2-table__expanded-row"
        >
          <td :colspan="columns.length">
            <slot name="expand" :row="row" :expanded="store.isRowExpanded(row)" />
          </td>
        </tr>
      </template>
      <!-- append 插槽 -->
      <tr v-if="$slots.append" class="v2-table__append-row">
        <td :colspan="columns.length">
          <slot name="append" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { getPropByPath } from '../../../utils/objects'
import { showTooltip, hideTooltip } from './overflow-tooltip'

// 用于渲染 VNodes 的 functional 组件
const CellRenderer = {
  functional: true,
  props: {
    renderFn: { type: Function },
    scopeData: { type: Object },
  },
  render(h, ctx) {
    const { renderFn, scopeData } = ctx.props
    if (!renderFn) return null
    const result = renderFn(scopeData)
    return Array.isArray(result) ? result : [result]
  },
}

export default {
  name: 'V2TableBody',

  components: {
    CellRenderer,
  },

  inject: ['tableStore'],

  props: {
    columns: { type: Array, default: () => [] },
    data: { type: Array, default: () => [] },
    tableWidth: { type: Number, default: 0 },
    gutterWidth: { type: Number, default: 0 },
    emptyText: { type: String, default: '暂无数据' },
    rowClassName: { type: [Function, String] },
    rowStyle: { type: [Function, Object] },
    cellClassName: { type: [Function, String] },
    cellStyle: { type: [Function, Object] },
    spanMethod: { type: Function },
    highlightCurrentRow: { type: Boolean, default: false },
    tooltipEffect: { type: String, default: 'dark' },
    tooltipOptions: { type: Object, default: () => ({}) },
  },

  computed: {
    store() {
      return this.tableStore
    },
    tableStyle() {
      return this.tableWidth ? { width: this.tableWidth + 'px' } : {}
    },
    hasExpandColumn() {
      return this.columns.some((c) => c.type === 'expand')
    },
    /** 根据 spanMethod 计算合并映射表 */
    mergedCells() {
      if (!this.spanMethod) return null
      const map = {}
      this.data.forEach((row, rowIndex) => {
        this.columns.forEach((col, colIndex) => {
          const result = this.spanMethod({ row, column: col, rowIndex, columnIndex: colIndex })
          if (result) {
            if (result.rowspan === 0 && result.colspan === 0) {
              // 被合并掉的单元格，不渲染
              map[this.mergeKey(rowIndex, colIndex)] = false
            } else if (result.rowspan > 1 || result.colspan > 1) {
              // 起始合并单元格，记录跨度和合并覆盖区域
              map[this.mergeKey(rowIndex, colIndex)] = { rowspan: result.rowspan, colspan: result.colspan }
            }
          }
        })
      })
      return map
    },
  },

  methods: {
    /** 生成合并键 */
    mergeKey(rowIndex, colIndex) {
      return rowIndex + '-' + colIndex
    },

    /** 生成 td 上的 rowspan/colspan 属性 */
    mergeAttrs(row, col, rowIndex, colIndex) {
      if (!this.mergedCells) return {}
      const info = this.mergedCells[this.mergeKey(rowIndex, colIndex)]
      if (!info) return {}
      const attrs = {}
      if (info.rowspan > 1) attrs.rowspan = info.rowspan
      if (info.colspan > 1) attrs.colspan = info.colspan
      return attrs
    },

    getRowKey(row) {
      return this.store.getRowKey(row)
    },

    getCellValue(row, col) {
      const prop = col.property || col.prop
      if (!prop) return ''
      const result = getPropByPath(row, prop)
      return result.v === undefined || result.v === null ? '' : result.v
    },

    getIndex(rowIndex) {
      const col = this.columns.find((c) => c.type === 'index')
      if (!col) return rowIndex + 1
      if (typeof col.index === 'function') {
        return col.index(rowIndex)
      }
      if (typeof col.index === 'number') {
        return col.index + rowIndex
      }
      return rowIndex + 1
    },

    rowClasses(row, rowIndex) {
      const classes = []
      if (this.store.isRowSelected(row)) {
        classes.push('is-selected')
      }
      if (this.highlightCurrentRow && this.store.state.currentRow === row) {
        classes.push('is-current')
      }
      if (this.store.isRowExpanded(row)) {
        classes.push('is-expanded')
      }
      // 自定义行类名
      if (typeof this.rowClassName === 'function') {
        const cls = this.rowClassName({ row, rowIndex })
        if (cls) classes.push(cls)
      } else if (typeof this.rowClassName === 'string') {
        classes.push(this.rowClassName)
      }
      return classes
    },

    rowStyles(row, rowIndex) {
      if (typeof this.rowStyle === 'function') {
        return this.rowStyle({ row, rowIndex }) || {}
      }
      if (typeof this.rowStyle === 'object') {
        return this.rowStyle
      }
      return {}
    },

    cellClasses(col, rowIndex, colIndex) {
      const classes = []
      const align = col.align || 'left'
      classes.push(`is-align-${align}`)
      if (col.className) classes.push(col.className)
      // 固定列 class
      if (col.fixed === true || col.fixed === 'left') {
        classes.push('is-left-fixed')
        if (this.store.state.leftFixedShadow) classes.push('is-left-shadow')
      }
      if (col.fixed === 'right') {
        classes.push('is-right-fixed')
        if (this.store.state.rightFixedShadow) classes.push('is-right-shadow')
      }
      // 自定义单元格类名
      if (typeof this.cellClassName === 'function') {
        const cls = this.cellClassName({
          row: this.data[rowIndex],
          column: col,
          rowIndex,
          columnIndex: colIndex,
        })
        if (cls) classes.push(cls)
      } else if (typeof this.cellClassName === 'string') {
        classes.push(this.cellClassName)
      }
      return classes
    },

    cellStyles(col, rowIndex, colIndex) {
      const style = {}
      if (col.realWidth) {
        style.width = col.realWidth + 'px'
      }
      if (col.fixed === true || col.fixed === 'left') {
        style.position = 'sticky'
        style.left = (col.fixedLeft || 0) + 'px'
        style.zIndex = 2
      }
      if (col.fixed === 'right') {
        style.position = 'sticky'
        style.right = (col.fixedRight || 0) + 'px'
        style.zIndex = 2
      }
      // 自定义单元格样式
      if (typeof this.cellStyle === 'function') {
        Object.assign(style, this.cellStyle({
          row: this.data[rowIndex],
          column: col,
          rowIndex,
          columnIndex: colIndex,
        }) || {})
      } else if (typeof this.cellStyle === 'object') {
        Object.assign(style, this.cellStyle)
      }
      return style
    },

    // --- 事件处理 ---
    handleRowClick(row, index, event) {
      const column = this.columns[0] // 默认第一个可见列
      this.$emit('row-click', row, column, event)
      // 单选高亮
      if (this.highlightCurrentRow) {
        const old = this.store.setCurrentRow(row)
        this.$emit('current-change', row, old)
      }
    },

    handleRowDblclick(row, index, event) {
      this.$emit('row-dblclick', row, this.columns[0], event)
    },

    handleRowContextmenu(row, index, event) {
      this.$emit('row-contextmenu', row, this.columns[0], event)
    },

    handleRowMouseEnter(row, index, event) {
      this.store.setHoverRow(row)
    },
    handleRowMouseLeave(row, index, event) {
      this.store.setHoverRow(null)
    },

    handleCellClick(row, col, rowIndex, colIndex, event) {
      this.$emit('cell-click', row, col, event.target, event)
    },

    handleCellDblclick(row, col, rowIndex, colIndex, event) {
      this.$emit('cell-dblclick', row, col, event.target, event)
    },

    handleCellContextmenu(row, col, rowIndex, colIndex, event) {
      this.$emit('cell-contextmenu', row, col, event.target, event)
    },

    handleCellMouseEnter(row, col, rowIndex, colIndex, event) {
      this.$emit('cell-mouse-enter', row, col, event.target, event)
      // showOverflowTooltip
      if (col.showOverflowTooltip) {
        showTooltip(event.currentTarget, col, row, {
          effect: this.tooltipEffect,
          ...(this.tooltipOptions || {}),
        })
      }
    },

    handleCellMouseLeave(row, col, rowIndex, colIndex, event) {
      this.$emit('cell-mouse-leave', row, col, event.target, event)
      if (col.showOverflowTooltip) {
        hideTooltip()
      }
    },

    handleSelectRow(row) {
      this.store.toggleRowSelection(row)
      this.$emit('selection-change', this.store.state.selection)
      this.$emit('select', this.store.state.selection, row)
    },

    toggleRowExpansion(row) {
      this.store.toggleRowExpansion(row)
      this.$emit('expand-change', row, this.store.state.expandedRows)
    },

    getCellScope(row, col, rowIndex) {
      return {
        row,
        column: col,
        $index: rowIndex,
      }
    },
  },
}
</script>