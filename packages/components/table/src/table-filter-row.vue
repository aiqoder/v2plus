<template>
  <table
    class="v2-table__filter-row"
    cellspacing="0"
    cellpadding="0"
    border="0"
    :style="tableStyle"
  >
    <colgroup>
      <col v-for="col in columns" :key="col.id" :style="{ width: col.realWidth + 'px' }" />
    </colgroup>
    <thead>
      <tr :class="rowClasses()" :style="rowStyles()">
        <th
          v-for="col in columns"
          :key="col.id"
          class="v2-table__filter-row-cell"
          :class="cellClasses(col)"
          :style="cellStyles(col)"
        >
          <div class="v2-table__filter-row-cell-inner">
            <template v-if="col.renderFilterCell">
              <filter-cell-renderer :render-fn="col.renderFilterCell" :scope-data="getCellScope(col)" />
            </template>
          </div>
        </th>
      </tr>
    </thead>
  </table>
</template>

<script>
// 用于渲染 VNodes 的 functional 组件 — 与 table-body CellRenderer 完全一致
const FilterCellRenderer = {
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
  name: 'V2TableFilterRow',

  components: {
    FilterCellRenderer,
  },

  inject: ['tableStore'],

  props: {
    columns: { type: Array, default: () => [] },
    tableWidth: { type: Number, default: 0 },
    filterRowClassName: { type: [Function, String] },
    filterRowStyle: { type: [Function, Object] },
    filterCellClassName: { type: [Function, String] },
    filterCellStyle: { type: [Function, Object] },
  },

  computed: {
    tableStyle() {
      return this.tableWidth ? { width: this.tableWidth + 'px' } : {}
    },
  },

  methods: {
    rowClasses() {
      const classes = []
      if (typeof this.filterRowClassName === 'function') {
        const cls = this.filterRowClassName({ rowIndex: 0 })
        if (cls) classes.push(cls)
      } else if (typeof this.filterRowClassName === 'string') {
        classes.push(this.filterRowClassName)
      }
      return classes
    },

    rowStyles() {
      if (typeof this.filterRowStyle === 'function') {
        return this.filterRowStyle({ rowIndex: 0 }) || {}
      }
      if (typeof this.filterRowStyle === 'object') {
        return this.filterRowStyle
      }
      return {}
    },

    cellClasses(col) {
      const classes = {
        [`is-align-${col.headerAlign || col.align || 'left'}`]: true,
        'is-hidden': col.type === 'expand',
      }
      if (col.fixed === true || col.fixed === 'left') {
        classes['is-left-fixed'] = true
        if (this.tableStore.state.leftFixedShadow) classes['is-left-shadow'] = true
      }
      if (col.fixed === 'right') {
        classes['is-right-fixed'] = true
        if (this.tableStore.state.rightFixedShadow) classes['is-right-shadow'] = true
      }
      const colIndex = this.columns.indexOf(col)
      if (typeof this.filterCellClassName === 'function') {
        const cls = this.filterCellClassName({ column: col, columnIndex: colIndex, $index: colIndex })
        if (cls) classes[cls] = true
      } else if (typeof this.filterCellClassName === 'string') {
        classes[this.filterCellClassName] = true
      }
      return classes
    },

    cellStyles(col) {
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
      const colIndex = this.columns.indexOf(col)
      if (typeof this.filterCellStyle === 'function') {
        Object.assign(style, this.filterCellStyle({ column: col, columnIndex: colIndex, $index: colIndex }) || {})
      } else if (typeof this.filterCellStyle === 'object') {
        Object.assign(style, this.filterCellStyle)
      }
      return style
    },

    getCellScope(col) {
      return {
        column: col,
        $index: this.columns.indexOf(col),
      }
    },
  },
}
</script>
