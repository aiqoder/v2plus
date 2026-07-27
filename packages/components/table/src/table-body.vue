<template>
  <!-- 虚拟滚动：外层容器固定高度，隔离 DOM 变更对 scrollHeight 的影响 -->
  <div
    v-if="virtualScroll"
    class="v2-table__virtual-container"
    :style="{ height: virtualTotalHeight + 'px' }"
  >
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
        <!-- 上方占位 -->
        <tr v-if="virtualOffsetTop > 0" class="v2-table__virtual-spacer">
          <td :colspan="columns.length" :style="{ height: virtualOffsetTop + 'px' }"></td>
        </tr>
        <template v-for="(row, rowIndex) in data">
        <!-- 主数据行 -->
        <tr
          :key="getRenderKey(row, rowIndex)"
          class="v2-table__row"
          :class="rowClasses(row, rowIndex)"
          :style="rowStyles(row, rowIndex)"
          :data-row-index="getActualRowIndex(rowIndex)"
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
              <div class="v2-table__cell-inner" :class="[col.showOverflowTooltip ? 'is-overflow' : '', getCellError(row, col) ? 'is-form-error' : '']">
                <!-- 表单编辑态：渲染编辑器 -->
                <template v-if="isCellEditing(row, col) && col.renderEdit">
                  <cell-renderer :render-fn="col.renderEdit" :scope-data="getEditScope(row, col)" />
                </template>
                <template v-else-if="isCellEditing(row, col) && resolveEditor(col)">
                  <component
                    :is="resolveEditor(col)"
                    :value="getCellValue(row, col)"
                    v-bind="getEditorProps(col)"
                    :size="formComponentSize"
                    @input="(v) => handleEditorChange(row, col, v)"
                    @blur="handleEditorBlur(row, col)"
                  />
                </template>
                <!-- 非编辑态：原始内容 -->
                <template v-else>
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
                </template><!-- end non-edit content -->
                <!-- 校验错误 -->
                <div v-if="getCellError(row, col)" class="v2-table__form-error-msg">{{ getCellError(row, col) }}</div>
              </div>
            </td>
          </template>
        </tr>
        <!-- 展开行内容 -->
        <tr
          v-if="hasExpandColumn && store.isRowExpanded(row)"
          :key="getRenderKey(row, rowIndex) + '_expand'"
          class="v2-table__expanded-row"
        >
          <td :colspan="columns.length">
            <slot name="expand" :row="row" :expanded="store.isRowExpanded(row)" />
          </td>
        </tr>
      </template>
      <!-- 虚拟滚动：下方占位行 -->
      <tr v-if="virtualScroll && virtualOffsetBottom > 0" class="v2-table__virtual-spacer">
        <td :colspan="columns.length" :style="{ height: virtualOffsetBottom + 'px' }"></td>
      </tr>
      <!-- append 插槽 -->
      <tr v-if="$slots.append" class="v2-table__append-row">
        <td :colspan="columns.length">
          <slot name="append" />
        </td>
      </tr>
    </tbody>
  </table>
  </div>
  <!-- 非虚拟滚动：直接渲染 table -->
  <table
    v-else
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
        <tr
          :key="getRenderKey(row, rowIndex)"
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
              <div class="v2-table__cell-inner" :class="[col.showOverflowTooltip ? 'is-overflow' : '', getCellError(row, col) ? 'is-form-error' : '']">
                <!-- 表单编辑态：渲染编辑器 -->
                <template v-if="isCellEditing(row, col) && col.renderEdit">
                  <cell-renderer :render-fn="col.renderEdit" :scope-data="getEditScope(row, col)" />
                </template>
                <template v-else-if="isCellEditing(row, col) && resolveEditor(col)">
                  <component
                    :is="resolveEditor(col)"
                    :value="getCellValue(row, col)"
                    v-bind="getEditorProps(col)"
                    :size="formComponentSize"
                    @input="(v) => handleEditorChange(row, col, v)"
                    @blur="handleEditorBlur(row, col)"
                  />
                </template>
                <!-- 非编辑态：原始内容 -->
                <template v-else>
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
                <label v-else-if="col.type === 'selection'" class="v2-table__checkbox">
                  <input
                    type="checkbox"
                    :checked="store.isRowSelected(row)"
                    :disabled="col.selectable && !col.selectable(row, rowIndex)"
                    @change="handleSelectRow(row)"
                  />
                </label>
                <span v-else-if="col.type === 'index'">
                  {{ getIndex(rowIndex) }}
                </span>
                <template v-else-if="col.renderCell">
                  <cell-renderer :render-fn="col.renderCell" :scope-data="getCellScope(row, col, rowIndex)" />
                </template>
                <template v-else-if="col.formatter">
                  {{ col.formatter(row, col, getCellValue(row, col), rowIndex) }}
                </template>
                <template v-else>
                  {{ getCellValue(row, col) }}
                </template>
                </template><!-- end non-edit content -->
                <!-- 校验错误 -->
                <div v-if="getCellError(row, col)" class="v2-table__form-error-msg">{{ getCellError(row, col) }}</div>
              </div>
            </td>
          </template>
        </tr>
        <tr
          v-if="hasExpandColumn && store.isRowExpanded(row)"
          :key="getRenderKey(row, rowIndex) + '_expand'"
          class="v2-table__expanded-row"
        >
          <td :colspan="columns.length">
            <slot name="expand" :row="row" :expanded="store.isRowExpanded(row)" />
          </td>
        </tr>
      </template>
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

  inject: {
    tableStore: { default: null },
    tableForm: { default: null },
  },

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
    // 虚拟滚动
    virtualScroll: { type: Boolean, default: false },
    virtualOffsetTop: { type: Number, default: 0 },
    virtualOffsetBottom: { type: Number, default: 0 },
    virtualVisibleStart: { type: Number, default: 0 },
    virtualTotalHeight: { type: Number, default: 0 },
  },

  data() {
    return {
      // 内置编辑器 → Element 组件映射
      editorMap: {
        input: 'el-input',
        textarea: 'el-input',
        number: 'el-input-number',
        select: 'el-select',
        switch: 'el-switch',
        date: 'el-date-picker',
        cascader: 'el-cascader',
        checkbox: 'el-checkbox-group',
        radio: 'el-radio-group',
        rate: 'el-rate',
        slider: 'el-slider',
        time: 'el-time-picker',
      },
    }
  },

  computed: {
    store() {
      return this.tableStore
    },
    /** 表单管理器引用 */
    formManager() {
      return this.tableForm ? this.tableForm.formManager : null
    },
    /** 表单是否启用 */
    formEnabled() {
      return !!(this.tableForm && this.tableForm.form)
    },
    /** 始终编辑模式 */
    alwaysEditing() {
      return this.formManager && this.formManager.alwaysEdit
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
    /** 表单组件的尺寸（与表格尺寸一致） */
    formComponentSize() {
      const tableSize = this.tableForm ? this.tableForm.size : null
      // Element 组件 size: large/default/small → 映射为 medium/small/mini
      const sizeMap = { large: 'medium', default: 'small', small: 'mini' }
      return sizeMap[tableSize] || 'small'
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

    /**
     * 生成 v-for 渲染 key
     * store.getRowKey 在未配置 row-key 时回退为行对象引用，
     * 此处确保渲染 key 始终为原始值（String/Number），否则回退为 rowIndex。
     */
    getRenderKey(row, rowIndex) {
      const key = this.store.getRowKey(row)
      if (typeof key === 'string' || typeof key === 'number') {
        return key
      }
      return rowIndex
    },

    // ============ 表单编辑方法 ============

    /** 当前行是否处于编辑态（不关心列是否有编辑器） */
    isRowEditing(row) {
      if (!this.formEnabled || !this.formManager) return false
      return this.alwaysEditing || this.formManager.isEditing(row)
    },

    /** 当前单元格是否渲染编辑器（行编辑中 + 列有编辑器） */
    isCellEditing(row, col) {
      if (!this.isRowEditing(row)) return false
      // 特殊列不进入编辑态
      if (col.type === 'selection' || col.type === 'index' || col.type === 'expand') return false
      // 该列需要声明 editor 或 #edit 插槽
      if (!col.editor && !col.renderEdit) return false
      return true
    },

    /** 解析编辑器组件 */
    resolveEditor(col) {
      // 优先使用 #edit 插槽
      if (col.renderEdit) return null // null = 使用插槽
      // 字符串 → 内置映射
      if (typeof col.editor === 'string') {
        return this.editorMap[col.editor] || null
      }
      // 直接返回组件引用
      return col.editor
    },

    /** 获取校验错误文本 */
    getCellError(row, col) {
      if (!this.formManager) return ''
      const prop = col.property || col.prop
      if (!prop) return ''
      return this.formManager.getCellError(row, prop)
    },

    /** 获取编辑器透传 props（处理特殊编辑器类型） */
    getEditorProps(col) {
      const props = { ...(col.editorProps || {}) }
      // textarea 使用 el-input type="textarea"
      if (col.editor === 'textarea') {
        props.type = 'textarea'
      }
      // select 的选项通过 editorProps.options 传入
      // el-select 使用 el-option 子组件渲染，这里简化为直接传递
      return props
    },

    /** 编辑器值变更处理 */
    handleEditorChange(row, col, value) {
      if (!this.formManager) return
      const prop = col.property || col.prop
      if (!prop) return
      // 实时写入行数据
      row[prop] = value
      // 按触发模式校验
      if (this.formManager.validateTrigger === 'change') {
        this.formManager.validateField(row, prop)
      }
      this.$emit('editor-change', row, col, value)
    },

    /** 编辑器失焦处理 */
    handleEditorBlur(row, col) {
      if (!this.formManager) return
      const prop = col.property || col.prop
      if (!prop) return
      if (this.formManager.validateTrigger === 'blur') {
        this.formManager.validateField(row, prop)
      }
    },

    /** 计算实际行索引（虚拟滚动模式下需要加上可见范围起始偏移） */
    getActualRowIndex(rowIndex) {
      return this.virtualScroll ? this.virtualVisibleStart + rowIndex : rowIndex
    },

    getCellValue(row, col) {
      const prop = col.property || col.prop
      if (!prop) return ''
      const result = getPropByPath(row, prop)
      return result.v === undefined || result.v === null ? '' : result.v
    },

    getIndex(rowIndex) {
      const actualIndex = this.getActualRowIndex(rowIndex)
      const col = this.columns.find((c) => c.type === 'index')
      if (!col) return actualIndex + 1
      if (typeof col.index === 'function') {
        return col.index(actualIndex)
      }
      if (typeof col.index === 'number') {
        return col.index + actualIndex
      }
      return actualIndex + 1
    },

    rowClasses(row, rowIndex) {
      const actualIndex = this.getActualRowIndex(rowIndex)
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
        const cls = this.rowClassName({ row, rowIndex: actualIndex })
        if (cls) classes.push(cls)
      } else if (typeof this.rowClassName === 'string') {
        classes.push(this.rowClassName)
      }
      return classes
    },

    rowStyles(row, rowIndex) {
      const actualIndex = this.getActualRowIndex(rowIndex)
      if (typeof this.rowStyle === 'function') {
        return this.rowStyle({ row, rowIndex: actualIndex }) || {}
      }
      if (typeof this.rowStyle === 'object') {
        return this.rowStyle
      }
      return {}
    },

    cellClasses(col, rowIndex, colIndex) {
      const actualIndex = this.getActualRowIndex(rowIndex)
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
          rowIndex: actualIndex,
          columnIndex: colIndex,
        })
        if (cls) classes.push(cls)
      } else if (typeof this.cellClassName === 'string') {
        classes.push(this.cellClassName)
      }
      return classes
    },

    cellStyles(col, rowIndex, colIndex) {
      const actualIndex = this.getActualRowIndex(rowIndex)
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
          rowIndex: actualIndex,
          columnIndex: colIndex,
        }) || {})
      } else if (typeof this.cellStyle === 'object') {
        Object.assign(style, this.cellStyle)
      }
      return style
    },

    // --- 事件处理 ---
    handleRowClick(row, index, event) {
      const column = this._lastClickedCol || this.columns[0]
      this._lastClickedCol = null
      this.$emit('row-click', row, column, event, this._lastClickedCol)
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
      this._lastClickedCol = col
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
      const scope = {
        row,
        column: col,
        $index: rowIndex,
      }
      // 表单模式：注入编辑状态和方法（editing 基于行而非列）
      if (this.formEnabled && this.formManager) {
        scope.editing = this.isRowEditing(row)
        scope.startEdit = () => this.formManager.startEdit([row])
        scope.commitEdit = () => this.formManager.commitEdit([row])
        scope.cancelEdit = () => this.formManager.cancelEdit([row])
        scope.deleteRows = (rs) => {
          if (this.tableForm) this.tableForm.deleteRows(rs || [row])
        }
      }
      return scope
    },

    /** 编辑器插槽作用域：与 #edit 插槽 props 保持一致 */
    getEditScope(row, col) {
      return {
        row,
        col,
        value: this.getCellValue(row, col),
        editing: true,
        setValue: (v) => this.handleEditorChange(row, col, v),
      }
    },

    /** 虚拟滚动：测量渲染后行高并上报 */
    measureRowHeights() {
      if (!this.virtualScroll) return
      const rows = this.$el.querySelectorAll('tr.v2-table__row')
      rows.forEach((row, i) => {
        const dataIndex = this.virtualVisibleStart + i
        const mainHeight = row.offsetHeight

        // 检查紧跟的展开行高度
        let expandedHeight = 0
        const nextRow = row.nextElementSibling
        if (nextRow && nextRow.classList.contains('v2-table__expanded-row')) {
          expandedHeight = nextRow.offsetHeight
        }

        this.$emit('row-measure', dataIndex, mainHeight, expandedHeight)
      })
    },
  },

  updated() {
    // 虚拟滚动：每次渲染后测量行高
    if (this.virtualScroll) {
      this.$nextTick(() => {
        this.measureRowHeights()
      })
    }
  },
}
</script>