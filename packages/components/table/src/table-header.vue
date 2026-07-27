<template>
  <table
    class="v2-table__header"
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
          class="v2-table__header-cell"
          :class="headerCellClasses(col)"
          :style="headerCellStyles(col)"
          @click="handleHeaderClick(col, $event)"
          @contextmenu="handleHeaderContextmenu(col, $event)"
        >
          <div class="v2-table__header-cell-inner">
            <!-- 多选全选框 -->
            <label v-if="col.type === 'selection'" class="v2-table__checkbox">
              <input
                type="checkbox"
                :checked="store.isAllSelected()"
                :indeterminate.prop="store.isIndeterminate()"
                @change="handleSelectAll"
              />
            </label>
            <!-- 自定义表头渲染 -->
            <template v-else-if="col.renderHeaderCell">
              <header-cell-renderer :render-fn="col.renderHeaderCell" :scope-data="headerCellScope(col)" />
            </template>
            <!-- 默认表头 -->
            <span v-else class="v2-table__header-label">{{ col.label }}</span>
            <!-- 排序图标 -->
            <span v-if="col.sortable" class="v2-table__sort-icon">
              <span
                class="v2-table__sort-caret"
                :class="sortClasses(col)"
                @click.stop="handleSort(col)"
              >
                <i class="ascending" />
                <i class="descending" />
              </span>
            </span>
            <!-- 筛选图标 -->
            <span
              v-if="col.filters && col.filters.length"
              class="v2-table__filter-icon"
              :class="{ 'is-active': col.filteredValue && col.filteredValue.length }"
              @click.stop="toggleFilter(col, $event)"
            >
              <svg viewBox="0 0 16 16" width="12" height="12">
                <path
                  d="M1.5 2.5h13L10 8v5.5L6 11V8L1.5 2.5z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </svg>
            </span>
            <!-- 列宽拖拽手柄 -->
            <span
              v-if="col.resizable !== false"
              class="v2-table__column-resizer"
              @mousedown.stop="handleResizeStart(col, $event)"
            />
          </div>
        </th>
      </tr>
    </thead>
  </table>
</template>

<script>
// 用于渲染表头插槽 VNodes 的 functional 组件（与 table-body CellRenderer 一致）
const HeaderCellRenderer = {
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
  name: 'V2TableHeader',

  components: {
    HeaderCellRenderer,
  },

  inject: ['tableStore'],

  props: {
    columns: { type: Array, default: () => [] },
    tableWidth: { type: Number, default: 0 },
    gutterWidth: { type: Number, default: 0 },
    stylePrefix: { type: String, default: '' },
    headerRowClassName: { type: [Function, String] },
    headerRowStyle: { type: [Function, Object] },
    headerCellClassName: { type: [Function, String] },
    headerCellStyle: { type: [Function, Object] },
  },

  computed: {
    store() {
      return this.tableStore
    },
    tableStyle() {
      const style = this.tableWidth ? { width: this.tableWidth + 'px' } : {}
      if (this.gutterWidth) {
        style.paddingRight = this.gutterWidth + 'px'
        style.boxSizing = 'border-box'
      }
      return style
    },
  },

  methods: {
    headerCellClasses(col) {
      const classes = {
        'is-sortable': col.sortable,
        'is-filter': col.filters && col.filters.length,
        [`is-align-${col.headerAlign || col.align || 'left'}`]: true,
        'is-hidden': col.type === 'expand' || !this.store.state.isVisible,
        [col.labelClassName || '']: !!col.labelClassName,
      }
      // 固定列 class
      if (col.fixed === true || col.fixed === 'left') {
        classes['is-left-fixed'] = true
        if (this.store.state.leftFixedShadow) classes['is-left-shadow'] = true
      }
      if (col.fixed === 'right') {
        classes['is-right-fixed'] = true
        if (this.store.state.rightFixedShadow) classes['is-right-shadow'] = true
      }
      // 应用自定义表头单元格类名
      const colIndex = this.columns.indexOf(col)
      if (typeof this.headerCellClassName === 'function') {
        const cls = this.headerCellClassName({ column: col, columnIndex: colIndex, $index: colIndex })
        if (cls) classes[cls] = true
      } else if (typeof this.headerCellClassName === 'string') {
        classes[this.headerCellClassName] = true
      }
      return classes
    },

    headerCellStyles(col) {
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
      // 应用自定义表头单元格样式
      const colIndex = this.columns.indexOf(col)
      if (typeof this.headerCellStyle === 'function') {
        Object.assign(style, this.headerCellStyle({ column: col, columnIndex: colIndex, $index: colIndex }) || {})
      } else if (typeof this.headerCellStyle === 'object') {
        Object.assign(style, this.headerCellStyle)
      }
      return style
    },

    rowClasses() {
      const classes = []
      if (typeof this.headerRowClassName === 'function') {
        const cls = this.headerRowClassName({ rowIndex: 0 })
        if (cls) classes.push(cls)
      } else if (typeof this.headerRowClassName === 'string') {
        classes.push(this.headerRowClassName)
      }
      return classes
    },

    rowStyles() {
      if (typeof this.headerRowStyle === 'function') {
        return this.headerRowStyle({ rowIndex: 0 }) || {}
      }
      if (typeof this.headerRowStyle === 'object') {
        return this.headerRowStyle
      }
      return {}
    },

    sortClasses(col) {
      const state = this.store.state.sortState
      if (state.prop === (col.property || col.prop)) {
        if (state.order === 'ascending') return 'is-ascending'
        if (state.order === 'descending') return 'is-descending'
      }
      return ''
    },

    handleHeaderClick(col, event) {
      this.$emit('header-click', col, event)
    },

    handleHeaderContextmenu(col, event) {
      this.$emit('header-contextmenu', col, event)
    },

    handleSort(col) {
      if (!col.sortable) return
      const order = this.store.state.sortState.order
      const prop = col.property || col.prop
      const sortOrders = col.sortOrders || ['ascending', 'descending', null]
      let nextOrder

      if (this.store.state.sortState.prop !== prop) {
        nextOrder = sortOrders[0] || 'ascending'
      } else {
        const currentIdx = sortOrders.indexOf(order)
        if (currentIdx < 0) {
          nextOrder = sortOrders[0] || 'ascending'
        } else {
          nextOrder = sortOrders[(currentIdx + 1) % sortOrders.length] || null
        }
      }

      this.store.setSort(prop, nextOrder)
      this.$emit('sort-change', { column: col, prop, order: nextOrder })
    },

    handleSelectAll() {
      this.store.toggleAllSelection()
      this.$emit('select-all', this.store.state.selection)
    },

    toggleFilter(col, event) {
      this.$emit('filter-click', col, event)
    },

    handleResizeStart(col, event) {
      event.preventDefault()
      const startX = event.pageX
      const startWidth = col.realWidth || parseInt(col.width) || 80

      // 拖拽期间禁用横向滚动条闪烁
      document.body.style.userSelect = 'none'
      const tableEl = this.$el.closest('.v2-table')
      if (tableEl) tableEl.classList.add('is-resizing')

      const onMouseMove = (e) => {
        const diff = e.pageX - startX
        const newWidth = Math.max(40, startWidth + diff)
        col.realWidth = newWidth
      }

      const onMouseUp = (e) => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.userSelect = ''
        if (tableEl) tableEl.classList.remove('is-resizing')
        const newWidth = col.realWidth
        // 将拖拽后的宽度固化为列的 width，使其成为固定宽度列
        // 这样后续 updateTableSize 重新计算时不会覆盖用户拖拽的结果
        col.width = newWidth
        this.$emit('header-dragend', newWidth, startWidth, col, e)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },

    /** 自定义表头插槽的 scope 数据 */
    headerCellScope(col) {
      return { column: col, $index: this.columns.indexOf(col) }
    },
  },
}
</script>
