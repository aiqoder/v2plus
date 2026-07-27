<script>
let columnId = 0

/**
 * table-column 组件 - Renderless 列定义
 * 完全兼容 Element Plus el-table-column 的所有属性
 */
export default {
  name: 'V2TableColumn',

  inject: {
    tableStore: { default: null },
  },

  props: {
    // 列类型
    type: { type: String, default: 'default' },
    // 行索引（配合 type="index"）
    index: { type: [Number, Function] },
    // 列标签
    label: { type: String },
    // 列 key（筛选事件需要）
    columnKey: { type: String },
    // 对应字段名
    prop: { type: String },
    property: { type: String },
    // 列宽
    width: { type: [String, Number], default: '' },
    // 最小列宽
    minWidth: { type: [String, Number], default: '' },
    // 固定列
    fixed: { type: [Boolean, String], default: false },
    // 自定义表头渲染
    renderHeader: { type: Function },
    // 排序
    sortable: { type: [Boolean, String], default: false },
    sortMethod: { type: Function },
    sortBy: { type: [Function, String, Array] },
    sortOrders: { type: Array, default: () => ['ascending', 'descending', null] },
    // 可调整列宽
    resizable: { type: Boolean, default: true },
    // 格式化函数
    formatter: { type: Function },
    // 溢出 tooltip
    showOverflowTooltip: { type: [Boolean, Object], default: undefined },
    tooltipFormatter: { type: Function },
    // 对齐
    align: { type: String, default: 'left' },
    headerAlign: { type: String },
    // 样式类名
    className: { type: String },
    labelClassName: { type: String },
    // 选择相关（type="selection"）
    selectable: { type: Function },
    reserveSelection: { type: Boolean, default: false },
    // 筛选
    filters: { type: Array },
    filterPlacement: { type: String },
    filterClassName: { type: String },
    filterMultiple: { type: Boolean, default: true },
    filterMethod: { type: Function },
    filteredValue: { type: Array },

    // ===== 表单编辑 =====
    editor: { type: [String, Object, Function], default: '' },
    editorProps: { type: Object, default: () => ({}) },
    rules: { type: Array, default: () => [] },
  },

  data() {
    return {
      id: ++columnId,
      _renderCell: null,
      _renderHeaderCell: null,
      _renderFilterIcon: null,
      _renderExpand: null,
      _renderFilterCell: null,
      _renderEdit: null,
    }
  },

  computed: {
    // 实际使用的 prop 字段
    realProp() {
      return this.prop || this.property
    },
    // 列配置对象
    columnConfig() {
      return {
        id: this.id,
        type: this.type,
        index: this.index,
        label: this.label,
        columnKey: this.columnKey || this.realProp,
        property: this.realProp,
        prop: this.realProp,
        width: this.width,
        minWidth: this.minWidth,
        fixed: this.fixed,
        renderHeader: this.renderHeader,
        sortable: this.sortable,
        sortMethod: this.sortMethod,
        sortBy: this.sortBy,
        sortOrders: this.sortOrders,
        resizable: this.resizable,
        realWidth: null, // 预声明响应式属性，支持拖拽调整列宽
        fixedLeft: 0,   // 预声明响应式属性
        fixedRight: 0,  // 预声明响应式属性
        formatter: this.formatter,
        showOverflowTooltip: this.showOverflowTooltip,
        tooltipFormatter: this.tooltipFormatter,
        align: this.align,
        headerAlign: this.headerAlign,
        className: this.className,
        labelClassName: this.labelClassName,
        selectable: this.selectable,
        reserveSelection: this.reserveSelection,
        filters: this.filters,
        filterPlacement: this.filterPlacement,
        filterClassName: this.filterClassName,
        filterMultiple: this.filterMultiple,
        filterMethod: this.filterMethod,
        filteredValue: this.filteredValue || [],
        // 渲染函数 (由作用域插槽生成)
        renderCell: this._renderCell,
        renderHeaderCell: this._renderHeaderCell,
        renderFilterIcon: this._renderFilterIcon,
        renderExpand: this._renderExpand,
        renderFilterCell: this._renderFilterCell,
        renderEdit: this._renderEdit,
        // 表单编辑
        editor: this.editor,
        editorProps: this.editorProps,
        rules: this.rules,
      }
    },
  },

  created() {
    // 将插槽转换为渲染函数
    this.$watch(
      () => this.$scopedSlots.default,
      (slot) => { this._renderCell = slot || null },
      { immediate: true }
    )

    this.$watch(
      () => this.$scopedSlots.header,
      (slot) => { this._renderHeaderCell = slot || null },
      { immediate: true }
    )

    this.$watch(
      () => this.$scopedSlots['filter-icon'],
      (slot) => { this._renderFilterIcon = slot || null },
      { immediate: true }
    )

    this.$watch(
      () => this.$scopedSlots.expand,
      (slot) => { this._renderExpand = slot || null },
      { immediate: true }
    )

    this.$watch(
      () => this.$scopedSlots['filter-cell'],
      (slot) => { this._renderFilterCell = slot || null },
      { immediate: true }
    )

    this.$watch(
      () => this.$scopedSlots.edit,
      (slot) => { this._renderEdit = slot || null },
      { immediate: true }
    )
  },

  mounted() {
    // 强制重新捕获：created() 的 immediate watcher 可能因时序问题遗漏具名 slot
    this.captureSlots()
    if (this.tableStore) {
      this.tableStore.insertColumn(this.columnConfig)
    }
  },

  updated() {
    this.captureSlots()
    if (this.tableStore) {
      this.tableStore.insertColumn(this.columnConfig)
    }
  },

  destroyed() {
    if (this.tableStore && this.tableStore.state && this.tableStore.state.columns) {
      this.tableStore.removeColumn(this.id)
    }
  },

  methods: {
    /** 从 $scopedSlots 捕获所有插槽渲染函数 */
    captureSlots() {
      this._renderCell = this.$scopedSlots.default || null
      this._renderHeaderCell = this.$scopedSlots.header || null
      this._renderFilterIcon = this.$scopedSlots['filter-icon'] || null
      this._renderExpand = this.$scopedSlots.expand || null
      this._renderFilterCell = this.$scopedSlots['filter-cell'] || null
      this._renderEdit = this.$scopedSlots.edit || null
    },
  },

  // Renderless - 不渲染任何 DOM
  render() {
    return null
  },
}
</script>
