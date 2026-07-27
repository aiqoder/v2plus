<template>
  <div
    ref="tableWrapper"
    class="v2-table"
    :class="tableClasses"
    :style="tableComputedStyle"
  >
    <!-- 表单工具栏 -->
    <div v-if="form && formManager" class="v2-table__form-toolbar">
      <slot
        name="toolbar"
        :editing="formManager.editingKeys"
        :selection-count="selectionCount"
        :start-edit="formManager.startEdit.bind(formManager)"
        :commit-edit="formManager.commitEdit.bind(formManager)"
        :cancel-edit="formManager.cancelEdit.bind(formManager)"
        :delete-rows="deleteRows"
        :validate-all="formManager.validateAll.bind(formManager)"
        :clear-validate="formManager.clearValidate.bind(formManager)"
      />
    </div>

    <!-- 表头区域（固定） -->
    <div
      v-if="showHeader"
      ref="headerWrapper"
      class="v2-table__header-wrapper"
    >
      <table-header
        :columns="store.state.columns"
        :table-width="store.state.tableWidth"
        :gutter-width="store.state.gutterWidth"
        :header-row-class-name="headerRowClassName"
        :header-row-style="headerRowStyle"
        :header-cell-class-name="headerCellClassName"
        :header-cell-style="headerCellStyle"
        @header-click="handleHeaderClick"
        @header-contextmenu="handleHeaderContextmenu"
        @sort-change="handleSortChange"
        @select-all="handleSelectAll"
        @filter-click="handleFilterClick"
        @header-dragend="handleHeaderDragend"
      />
      <table-filter-row
        v-if="showFilterRow"
        :columns="store.state.columns"
        :table-width="store.state.tableWidth"
        :filter-row-class-name="filterRowClassName"
        :filter-row-style="filterRowStyle"
        :filter-cell-class-name="filterCellClassName"
        :filter-cell-style="filterCellStyle"
      />
    </div>

    <!-- 表体区域（可滚动） -->
    <div
      ref="bodyWrapper"
      class="v2-table__body-wrapper"
      :style="{ maxHeight: bodyHeight }"
      @scroll="handleBodyScroll"
    >
      <table-body
        :columns="store.state.columns"
        :data="computedData"
        :table-width="store.state.tableWidth"
        :gutter-width="store.state.gutterWidth"
        :empty-text="emptyText"
        :row-class-name="rowClassName"
        :row-style="rowStyle"
        :cell-class-name="cellClassName"
        :cell-style="cellStyle"
        :span-method="spanMethod"
        :highlight-current-row="highlightCurrentRow"
        :tooltip-effect="tooltipEffect"
        :tooltip-options="tooltipOptions"
        :virtual-scroll="virtualScroll"
        :virtual-offset-top="virtualState.offsetTop"
        :virtual-offset-bottom="virtualState.offsetBottom"
        :virtual-visible-start="virtualState.visibleStart"
        :virtual-total-height="virtualScrollManager ? virtualScrollManager.totalHeight : 0"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblclick"
        @row-contextmenu="handleRowContextmenu"
        @cell-click="handleCellClick"
        @cell-dblclick="handleCellDblclick"
        @cell-contextmenu="handleCellContextmenu"
        @cell-mouse-enter="handleCellMouseEnter"
        @cell-mouse-leave="handleCellMouseLeave"
        @selection-change="handleSelectionChange"
        @select="handleSelect"
        @expand-change="handleExpandChange"
        @current-change="handleCurrentChange"
        @row-measure="handleRowMeasure"
      >
        <template #empty>
          <slot name="empty">{{ emptyText }}</slot>
        </template>
        <template #append>
          <slot name="append" />
        </template>
        <template #expand="{ row, expanded }">
          <slot name="expand" :row="row" :expanded="expanded" />
        </template>
      </table-body>

      <!-- 指示空数据的提示层 -->
      <div v-if="computedData.length === 0 && !$slots.empty" class="v2-table__empty-block">
        <span class="v2-table__empty-text">{{ emptyText }}</span>
      </div>
    </div>

    <!-- 合计行区域（固定底部） -->
    <div
      v-if="showSummary"
      ref="footerWrapper"
      class="v2-table__footer-wrapper"
    >
      <table-footer
        :columns="store.state.columns"
        :data="computedData"
        :table-width="store.state.tableWidth"
        :show-summary="showSummary"
        :sum-text="sumText"
        :summary-method="summaryMethod"
      />
    </div>

    <!-- 筛选面板 -->
    <filter-panel
      v-if="activeFilterColumn"
      :visible="filterPanelVisible"
      :column="activeFilterColumn"
      @confirm="handleFilterConfirm"
    />
    <!-- ⚠️ 隐藏插槽：必须渲染默认插槽以使 table-column 子组件挂载 -->
    <div style="display: none !important">
      <slot />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import TableStore from './store/index'
import TableHeader from './table-header.vue'
import TableBody from './table-body.vue'
import TableFooter from './table-footer.vue'
import TableFilterRow from './table-filter-row.vue'
import FilterPanel from './filter-panel.vue'
import VirtualScrollManager from './virtual-scroll'
import FormManager from './form/manager'
import { getScrollBarWidth } from '../../../utils/scroll'

export default {
  name: 'V2Table',

  components: {
    TableHeader,
    TableBody,
    TableFooter,
    TableFilterRow,
    FilterPanel,
  },

  provide() {
    return {
      tableStore: this.store,
      tableForm: this,
    }
  },

  props: {
    // ===== 数据 =====
    data: { type: Array, default: () => [] },

    // ===== 尺寸 =====
    height: { type: [String, Number] },
    maxHeight: { type: [String, Number] },
    size: { type: String }, // large / default / small

    // ===== 外观 =====
    stripe: { type: Boolean, default: false },
    border: { type: Boolean, default: false },
    fit: { type: Boolean, default: true },
    showHeader: { type: Boolean, default: true },
    highlightCurrentRow: { type: Boolean, default: false },

    // ===== 行样式 =====
    rowClassName: { type: [Function, String] },
    rowStyle: { type: [Function, Object] },
    rowKey: { type: [Function, String] },
    currentRowKey: { type: [String, Number] },

    // ===== 单元格样式 =====
    cellClassName: { type: [Function, String] },
    cellStyle: { type: [Function, Object] },

    // ===== 表头样式 =====
    headerRowClassName: { type: [Function, String] },
    headerRowStyle: { type: [Function, Object] },
    headerCellClassName: { type: [Function, String] },
    headerCellStyle: { type: [Function, Object] },

    // ===== 筛选行 =====
    showFilterRow: { type: Boolean, default: false },
    filterRowClassName: { type: [Function, String] },
    filterRowStyle: { type: [Function, Object] },
    filterCellClassName: { type: [Function, String] },
    filterCellStyle: { type: [Function, Object] },

    // ===== 空状态 =====
    emptyText: { type: String, default: '暂无数据' },

    // ===== 展开行 =====
    defaultExpandAll: { type: Boolean, default: false },
    expandRowKeys: { type: Array },

    // ===== 排序 =====
    defaultSort: { type: Object },

    // ===== Tooltip =====
    tooltipEffect: { type: String, default: 'dark' },
    tooltipOptions: { type: Object },

    // ===== 合计行 =====
    showSummary: { type: Boolean, default: false },
    sumText: { type: String, default: '合计' },
    summaryMethod: { type: Function },

    // ===== 合并单元格 =====
    spanMethod: { type: Function },

    // ===== 多选 =====
    selectOnIndeterminate: { type: Boolean, default: true },

    // ===== 树形数据 =====
    indent: { type: Number, default: 16 },
    lazy: { type: Boolean, default: false },
    load: { type: Function },
    treeProps: { type: Object, default: () => ({ hasChildren: 'hasChildren', children: 'children' }) },

    // ===== 布局 =====
    tableLayout: { type: String, default: 'fixed' },
    scrollbarAlwaysOn: { type: Boolean, default: false },
    flexible: { type: Boolean, default: false },

    // ===== 虚拟滚动 =====
    virtualScroll: { type: Boolean, default: false },
    estimatedRowHeight: { type: Number, default: 48 },
    overscanCount: { type: Number, default: 5 },

    // ===== 表单编辑 =====
    form: { type: [Boolean, Object], default: false },
  },

  data() {
    const store = new TableStore(this)
    return {
      store,
      filterPanelVisible: false,
      activeFilterColumn: null,
      resizeObserver: null,
      headerHeight: 0,
      footerHeight: 0,
      // 虚拟滚动
      virtualScrollManager: null,
      virtualState: {
        visibleData: [],
        offsetTop: 0,
        offsetBottom: 0,
        visibleStart: 0,
        visibleEnd: 0,
      },
      // 表单编辑
      formManager: null,
    }
  },

  computed: {
    tableClasses() {
      return [
        `v2-table--${this.size || 'default'}`,
        {
          'v2-table--fit': this.fit,
          'v2-table--striped': this.stripe,
          'v2-table--border': this.border,
          'v2-table--scrollable-x': this.isScrollX,
          'v2-table--scrollable-y': this.isScrollY,
          'v2-table--flexible': this.flexible,
          'v2-table--group': this.store.state.columns.some((col) => col.children),
          [`v2-table--layout-${this.tableLayout}`]: true,
        },
      ]
    },

    tableComputedStyle() {
      const style = {}
      if (this.height) {
        style.height = typeof this.height === 'number' ? `${this.height}px` : this.height
      }
      if (this.maxHeight) {
        style.maxHeight = typeof this.maxHeight === 'number' ? `${this.maxHeight}px` : this.maxHeight
      }
      return style
    },

    bodyHeight() {
      if (this.height) {
        const h = typeof this.height === 'number' ? this.height : parseInt(this.height)
        if (isNaN(h)) return null
        const offset = this.headerHeight + this.footerHeight + (this.border ? 2 : 0)
        return Math.max(0, h - offset) + 'px'
      }
      if (this.maxHeight) {
        const h = typeof this.maxHeight === 'number' ? this.maxHeight : parseInt(this.maxHeight)
        if (isNaN(h)) return null
        return h + 'px'
      }
      return null
    },

    isScrollX() {
      return this.store.state.needScrollX
    },

    isScrollY() {
      return !!this.bodyHeight
    },

    columns() {
      return this.store.state.columns
    },

    /** 响应式选中数（工具栏 slot scope 依赖） */
    selectionCount() {
      return this.store.state.selection.length
    },

    /** 全量排序后数据（虚拟滚动需要原始全量数据做位置计算） */
    fullSortedData() {
      // 直接访问 observable 属性以建立响应式依赖
      const sorted = this.store.state.sortedData
      if (sorted.length === 0 && this.store.state.data.length > 0) {
        return this.store.state.data
      }
      return sorted
    },

    computedData() {
      if (this.virtualScroll && this.virtualScrollManager) {
        return this.virtualState.visibleData
      }
      return this.store.getSortedData()
    },
  },

  watch: {
    data: {
      immediate: true,
      handler(val) {
        this.store.updateData(val)
      },
    },

    defaultSort: {
      immediate: true,
      handler(val) {
        if (val && val.prop) {
          this.store.setSort(val.prop, val.order || 'ascending')
        }
      },
    },

    currentRowKey(val) {
      if (val !== undefined && val !== null) {
        const row = this.store.state.data.find((r) => this.store.getRowKey(r) === val)
        if (row) this.store.setCurrentRow(row)
      }
    },

    // 排序/筛选/数据变化 → 更新虚拟滚动 + 退出编辑态
    fullSortedData: {
      handler(val, oldVal) {
        // 数据引用未变 → 跳过
        if (val === oldVal) return

        // 表单模式：排序/筛选时自动退出所有编辑态
        if (this.formManager) {
          this.formManager.exitAll()
        }

        // 虚拟滚动：重建位置缓存
        if (this.virtualScroll && this.virtualScrollManager) {
          this.virtualScrollManager.setData(val)
          this.syncVirtualState()
          this.$nextTick(() => {
            const bodyWrapper = this.$refs.bodyWrapper
            if (bodyWrapper) {
              bodyWrapper.scrollTop = 0
            }
          })
        }
      },
    },

    // 虚拟滚动：动态更新估算行高
    estimatedRowHeight(val) {
      if (this.virtualScrollManager) {
        this.virtualScrollManager.estimatedRowHeight = val
        this.virtualScrollManager.rebuildPositions()
        this.syncVirtualState()
      }
    },

    // 虚拟滚动：动态更新缓冲区大小
    overscanCount(val) {
      if (this.virtualScrollManager) {
        this.virtualScrollManager.overscan = Math.max(0, val)
        this.virtualScrollManager.updateVisibleRange()
        this.syncVirtualState()
      }
    },

    // 表单编辑：初始化/销毁 FormManager
    form: {
      immediate: true,
      handler(val) {
        if (val) {
          const opts = val === true ? {} : val
          if (!this.formManager) {
            this.formManager = new FormManager(this, opts)
            // always 模式：数据就绪后自动激活编辑
            if (this.formManager.alwaysEdit) {
              this.$nextTick(() => {
                this.formManager.startEdit()
              })
            }
            this.syncColumnRules()
          }
        } else {
          if (this.formManager) {
            this.formManager.destroy()
            this.formManager = null
          }
        }
      },
    },

    // 列变化时同步校验规则到 FormManager
    columns: {
      handler() {
        this.syncColumnRules()
      },
    },

    // always 模式：数据变化后重新激活编辑
    'store.state.data': {
      handler() {
        if (this.formManager && this.formManager.alwaysEdit) {
          this.$nextTick(() => {
            this.formManager.startEdit()
          })
        }
      },
    },
  },

  mounted() {
    this.updateTableSize()
    this.bindResizeObserver()

    // 虚拟滚动模式：模板 @scroll 已绑定，不再重复 addEventListener
    if (!this.virtualScroll) {
      this.bindScrollEvents()
    }

    // 初始化虚拟滚动
    if (this.virtualScroll) {
      this.initVirtualScroll()
    }

    // 初始默认展开
    if (this.defaultExpandAll) {
      this.store.state.data.forEach((row) => {
        if (row[this.treeProps.children] || this.lazy) {
          this.store.toggleRowExpansion(row, true)
        }
      })
    }
  },

  updated() {
    // 虚拟滚动：Vue DOM 补丁可能触发浏览器重置 scrollTop
    // 使用 rAF 确保在浏览器完成布局后再恢复滚动位置
    if (this._pendingScrollRestore !== null) {
      const saved = this._pendingScrollRestore
      this._pendingScrollRestore = null
      requestAnimationFrame(() => {
        const bw = this.$refs.bodyWrapper
        if (bw && bw.scrollTop !== saved) {
          bw.scrollTop = saved
        }
      })
    }
  },

  beforeDestroy() {
    this.unbindResizeObserver()
    if (this.virtualScrollManager) {
      this.virtualScrollManager.destroy()
      this.virtualScrollManager = null
    }
    if (this.formManager) {
      this.formManager.destroy()
      this.formManager = null
    }
    this.store.destroy()
  },

  methods: {
    // ============ 公开方法 (与 Element Plus 完全一致) ============

    /** 将列上的校验规则同步注册到 FormManager */
    syncColumnRules() {
      if (!this.formManager) return
      const cols = this.store.state.columns || []
      const handle = (list) => {
        list.forEach((col) => {
          if (col.prop && col.rules && col.rules.length > 0) {
            this.formManager.registerRules(col.prop, col.rules)
          }
          if (col.children && col.children.length) {
            handle(col.children)
          }
        })
      }
      handle(cols)
    },

    /** 清空所有选中行 */
    clearSelection() {
      this.store.clearSelection()
    },

    /** 获取当前选中的行 */
    getSelectionRows() {
      return this.store.getSelectionRows()
    },

    /** 获取半选行（树形数据） */
    getHalfSelectionRows() {
      return this.store.getHalfSelectionRows()
    },

    /** 切换某行的选中状态 */
    toggleRowSelection(row, selected) {
      this.store.toggleRowSelection(row, selected)
    },

    /** 切换全选/全不选 */
    toggleAllSelection() {
      this.store.toggleAllSelection()
    },

    /** 切换行展开 */
    toggleRowExpansion(row, expanded) {
      this.store.toggleRowExpansion(row, expanded)
    },

    /** 设置当前行（单选）*/
    setCurrentRow(row) {
      this.store.setCurrentRow(row)
    },

    /** 清空排序 */
    clearSort() {
      this.store.clearSort()
    },

    /** 清空筛选 */
    clearFilter(columnKeys) {
      this.store.clearFilter(columnKeys)
    },

    /** 重新布局 */
    doLayout() {
      this.$nextTick(() => {
        this.updateTableSize()
      })
    },

    /** 手动排序 */
    sort(prop, order) {
      this.store.setSort(prop, order)
    },

    /** 更新 lazy tree 子节点 */
    updateKeyChildren(key, children) {
      this.store.updateKeyChildren(key, children)
    },

    // ============ 表单编辑公开方法 ============

    /** 进入编辑态。rows 可选，不传=所有选中行，无选中=所有行 */
    startEdit(rows) {
      if (this.formManager) this.formManager.startEdit(rows)
    },

    /** 校验并提交。rows 可选，不传=所有编辑中行。返回 { valid, errors } */
    commitEdit(rows) {
      return this.formManager ? this.formManager.commitEdit(rows) : Promise.resolve({ valid: true, errors: new Map() })
    },

    /** 取消编辑，恢复备份。rows 可选 */
    cancelEdit(rows) {
      if (this.formManager) this.formManager.cancelEdit(rows)
    },

    /** 删除行。rows 可选，不传=所有选中行 */
    deleteRows(rows) {
      const targetRows = this.formManager
        ? this.formManager._resolveRows(rows)
        : (rows ? (Array.isArray(rows) ? rows : [rows]) : this.store.state.selection)
      if (!targetRows || targetRows.length === 0) return
      const data = this.store.state.data
      targetRows.forEach((row) => {
        const idx = data.indexOf(row)
        if (idx !== -1) data.splice(idx, 1)
      })
      this.store.updateData(data)
      this.$emit('form-delete', targetRows)
    },

    /** 校验单行 */
    validateRow(row) {
      return this.formManager ? this.formManager.validateRow(row) : Promise.resolve({ valid: true, fieldErrors: new Map() })
    },

    /** 校验所有行 */
    validateAll() {
      return this.formManager ? this.formManager.validateAll() : Promise.resolve({ valid: true, rowErrors: new Map() })
    },

    /** 清除校验错误 */
    clearValidate(rows) {
      if (this.formManager) this.formManager.clearValidate(rows)
    },

    /** 获取修改过的行 */
    getModifiedRows() {
      return this.formManager ? this.formManager.getModifiedRows() : []
    },

    /** 滚动到指定位置 */
    scrollTo(options, yCoord) {
      const bodyWrapper = this.$refs.bodyWrapper
      if (!bodyWrapper) return
      if (typeof options === 'number') {
        bodyWrapper.scrollTop = options
        if (yCoord !== undefined) bodyWrapper.scrollLeft = yCoord
      } else if (typeof options === 'object') {
        if (options.top !== undefined) bodyWrapper.scrollTop = options.top
        if (options.left !== undefined) bodyWrapper.scrollLeft = options.left
      }
    },

    /** 设置垂直滚动位置 */
    setScrollTop(top) {
      const bodyWrapper = this.$refs.bodyWrapper
      if (bodyWrapper) bodyWrapper.scrollTop = top
    },

    /** 设置水平滚动位置 */
    setScrollLeft(left) {
      const bodyWrapper = this.$refs.bodyWrapper
      if (bodyWrapper) bodyWrapper.scrollLeft = left
    },

    // ============ 内部方法 ============

    updateTableSize() {
      this.$nextTick(() => {
        const wrapper = this.$refs.tableWrapper
        if (!wrapper) return

        let width = wrapper.clientWidth
        const height = wrapper.clientHeight

        // 记录表头和表尾高度
        const headerWrapper = this.$refs.headerWrapper
        const footerWrapper = this.$refs.footerWrapper
        this.headerHeight = headerWrapper ? headerWrapper.offsetHeight : 0
        this.footerHeight = footerWrapper ? footerWrapper.offsetHeight : 0

        // 虚拟滚动：内容高度必定超出容器，竖向滚动条始终存在
        // 需要从容器宽度中扣减滚动条宽度，避免横向溢出
        if (this.virtualScroll) {
          const sbWidth = getScrollBarWidth()
          width = Math.max(0, width - sbWidth)
          this.store.state.gutterWidth = sbWidth
        }

        this.store.setTableSize(width, height)

        // 虚拟滚动：setTableSize 可能基于 scrollY 重置 gutterWidth，强制修正
        if (this.virtualScroll) {
          this.store.state.gutterWidth = getScrollBarWidth()
        }

        // 虚拟滚动：更新可视区域高度
        if (this.virtualScroll && this.virtualScrollManager) {
          const bodyWrapper = this.$refs.bodyWrapper
          if (bodyWrapper) {
            this.virtualScrollManager.setContainerHeight(bodyWrapper.clientHeight)
            this.syncVirtualState()
          }
        }
      })
    },

    // ============ 虚拟滚动方法 ============

    initVirtualScroll() {
      const data = this.store.getSortedData()
      this.virtualScrollManager = new VirtualScrollManager({
        estimatedRowHeight: this.estimatedRowHeight,
        overscan: this.overscanCount,
      })
      this.virtualScrollManager.setData(data)
      this.$nextTick(() => {
        const bodyWrapper = this.$refs.bodyWrapper
        if (bodyWrapper) {
          this.virtualScrollManager.setContainerHeight(bodyWrapper.clientHeight)
        }
        this.syncVirtualState()
      })
    },

    syncVirtualState() {
      const range = this.virtualScrollManager.getVisibleRange()
      if (!range) return
      // 原地修改属性，避免替换整个对象触发不必要的响应式重建
      this.virtualState.visibleData = range.visibleData
      this.virtualState.offsetTop = range.offsetTop
      this.virtualState.offsetBottom = range.offsetBottom
      this.virtualState.visibleStart = range.start
      this.virtualState.visibleEnd = range.end
    },

    /** 表体测量行高后的回调 */
    handleRowMeasure(dataIndex, height, expandedHeight) {
      if (!this.virtualScrollManager) return
      const scrollTopBefore = this.virtualScrollManager.scrollTop
      const changed = this.virtualScrollManager.measureRow(dataIndex, height, expandedHeight)
      if (changed) {
        this.syncVirtualState()
        // 锚定补偿：若 manager 内部修正了 scrollTop，同步到 DOM
        const scrollTopAfter = this.virtualScrollManager.scrollTop
        if (Math.abs(scrollTopAfter - scrollTopBefore) > 1) {
          this.$nextTick(() => {
            const bodyWrapper = this.$refs.bodyWrapper
            if (bodyWrapper) {
              this._adjustingScroll = true
              bodyWrapper.scrollTop = scrollTopAfter
              this._adjustingScroll = false
            }
          })
        }
      }
    },

    bindResizeObserver() {
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          this.updateTableSize()
        })
        if (this.$refs.tableWrapper) {
          this.resizeObserver.observe(this.$refs.tableWrapper)
        }
      }
    },

    unbindResizeObserver() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }
    },

    bindScrollEvents() {
      const bodyWrapper = this.$refs.bodyWrapper
      if (bodyWrapper) {
        bodyWrapper.addEventListener('scroll', this.handleBodyScroll, { passive: true })
      }
    },

    handleBodyScroll(event) {
      // 跳过程序化滚动调整（避免无限循环）
      if (this._adjustingScroll) return

      const target = event.target
      const scrollLeft = target.scrollLeft
      // 同步表头水平滚动
      const headerWrapper = this.$refs.headerWrapper
      if (headerWrapper) {
        headerWrapper.scrollLeft = scrollLeft
      }
      // 同步表尾水平滚动
      const footerWrapper = this.$refs.footerWrapper
      if (footerWrapper) {
        footerWrapper.scrollLeft = scrollLeft
      }

      // 更新固定列阴影状态
      const maxScrollLeft = target.scrollWidth - target.clientWidth
      this.store.state.leftFixedShadow = scrollLeft > 0
      this.store.state.rightFixedShadow = scrollLeft < maxScrollLeft

      // 更新 scrollX/scrollY 到 store
      this.store.state.scrollX = scrollLeft
      this.store.state.scrollY = target.scrollTop

      // 检测竖向滚动条并更新 gutterWidth
      const hasScrollY = target.scrollHeight > target.clientHeight
      if (hasScrollY !== this._hasScrollY) {
        this._hasScrollY = hasScrollY
        // 重新计算列宽（竖向滚动条出现/消失影响可用宽度）
        this.store.state.gutterWidth = hasScrollY
          ? this.store.state.gutterWidth || getScrollBarWidth()
          : 0
      }

      // 虚拟滚动：同步更新可见范围（单监听 + 无 rAF 延迟，滚动条拖动实时响应）
      if (this.virtualScroll && this.virtualScrollManager) {
        const st = target.scrollTop
        const firstVisible = this.virtualScrollManager.findRowAtOffset(st)
        // 仅当首个可见行移出当前渲染窗口时才触发重渲染
        if (firstVisible < this.virtualState.visibleStart || firstVisible >= this.virtualState.visibleEnd) {
          this._pendingScrollRestore = st
          this.virtualScrollManager.setScrollTop(st)
          this.syncVirtualState()
        }
      }

      // 触发 scroll 事件
      this.$emit('scroll', {
        scrollLeft,
        scrollTop: target.scrollTop,
      })
    },

    // ============ 事件转发 ============

    handleSelect(selection, row) {
      this.$emit('select', selection, row)
    },

    handleSelectAll(selection) {
      this.$emit('select-all', selection)
    },

    handleSelectionChange(selection) {
      this.$emit('selection-change', selection)
    },

    handleCellClick(row, column, cell, event) {
      this.$emit('cell-click', row, column, cell, event)
    },

    handleCellDblclick(row, column, cell, event) {
      this.$emit('cell-dblclick', row, column, cell, event)
    },

    handleCellContextmenu(row, column, cell, event) {
      this.$emit('cell-contextmenu', row, column, cell, event)
    },

    handleCellMouseEnter(row, column, cell, event) {
      this.$emit('cell-mouse-enter', row, column, cell, event)
    },

    handleCellMouseLeave(row, column, cell, event) {
      this.$emit('cell-mouse-leave', row, column, cell, event)
    },

    handleRowClick(row, column, event) {
      // 表单 row 模式：单击行进入编辑态
      // 但点击含自定义渲染（如操作列）的单元格时不自动触发，交由插槽内的事件处理
      if (this.formManager && this.formManager.editMode === 'row') {
        if (!column || !column.renderCell) {
          this.formManager.startEdit([row])
        }
      }
      this.$emit('row-click', row, column, event)
    },

    handleRowDblclick(row, column, event) {
      this.$emit('row-dblclick', row, column, event)
    },

    handleRowContextmenu(row, column, event) {
      this.$emit('row-contextmenu', row, column, event)
    },

    handleHeaderClick(column, event) {
      this.$emit('header-click', column, event)
    },

    handleHeaderContextmenu(column, event) {
      this.$emit('header-contextmenu', column, event)
    },

    handleSortChange({ column, prop, order }) {
      this.$emit('sort-change', { column, prop, order })
    },

    handleFilterClick(column, event) {
      this.activeFilterColumn = column
      this.filterPanelVisible = !this.filterPanelVisible
    },

    handleFilterConfirm(values) {
      this.filterPanelVisible = false
      if (this.activeFilterColumn) {
        this.store.setFilter(this.activeFilterColumn.columnKey, values)
        this.$emit('filter-change', this.store.state.filters)
        this.activeFilterColumn = null
      }
    },

    handleHeaderDragend(newWidth, oldWidth, column, event) {
      this.$emit('header-dragend', newWidth, oldWidth, column, event)
      this.updateTableSize()
    },

    handleCurrentChange(currentRow, oldCurrentRow) {
      this.$emit('current-change', currentRow, oldCurrentRow)
    },

    handleExpandChange(row, expandedRows) {
      // 虚拟滚动：展开/折叠后清除该行高度缓存，触发重新测量
      if (this.virtualScroll && this.virtualScrollManager) {
        const dataIndex = this.fullSortedData.indexOf(row)
        if (dataIndex !== -1) {
          this.virtualScrollManager.clearRowHeight(dataIndex)
          this.syncVirtualState()
        }
      }
      this.$emit('expand-change', row, expandedRows)
    },
  },
}
</script>
