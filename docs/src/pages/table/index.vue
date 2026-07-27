<template>
  <div class="page">
    <h1 id="table">Table 表格</h1>
    <p>用于展示多条结构类似的数据，可对数据进行排序、筛选、选择、展开等操作。</p>

    <!-- ==================== 基础用法 ==================== -->
    <h2 id="basic-table">基础用法</h2>
    <p>基础的表格用法，通过 <code>border</code> 添加边框，<code>stripe</code> 添加斑马纹。通过 <code>show-overflow-tooltip</code> 在内容溢出时显示 tooltip。</p>
    <code-preview :source="basicSource" :demo="BasicTable" />

    <h2 id="table-with-status">带状态表格</h2>
    <p>使用 <code>row-class-name</code> 和插槽自定义行样式和内容。</p>
    <code-preview :source="statusSource" :demo="StatusTable" />

    <!-- ==================== 多选 ==================== -->
    <h2 id="multiple-select">多选</h2>
    <p>添加 <code>type="selection"</code> 的列即可开启多选功能。通过 <code>@selection-change</code> 监听选中变化，调用 <code>clearSelection()</code> 清空选中。</p>
    <code-preview :source="selectionSource" :demo="SelectionTable" />

    <!-- ==================== 排序 ==================== -->
    <h2 id="sorting">排序</h2>
    <p>在列上设置 <code>sortable</code> 即可启用排序。设为 <code>custom</code> 可使用远程排序（监听 <code>sort-change</code> 事件）。</p>
    <code-preview :source="sortSource" :demo="SortTable" />

    <h2 id="custom-sort">自定义排序方法</h2>
    <p>通过 <code>sort-method</code> 和 <code>sort-by</code> 自定义排序逻辑。</p>
    <code-preview :source="customSortSource" :demo="CustomSortTable" />

    <!-- ==================== 筛选 ==================== -->
    <h2 id="filter">筛选</h2>
    <p>在列上设置 <code>filters</code> 和 <code>column-key</code> 即可启用筛选。通过 <code>@filter-change</code> 监听筛选变化。</p>
    <code-preview :source="filterSource" :demo="FilterTable" />

    <!-- ==================== 筛选行 ==================== -->
    <h2 id="filter-row">筛选行</h2>
    <p>通过 <code>show-filter-row</code> 开启表格内联筛选行，配合 <code>#filter-cell</code> 插槽在表头下方放置筛选控件（输入框、下拉框等），实现快速筛选。筛选逻辑在父组件自行管理。</p>
    <code-preview :source="filterRowSource" :demo="FilterRowTable" />

    <!-- ==================== 展开行 ==================== -->
    <h2 id="expandable-row">展开行</h2>
    <p>添加 <code>type="expand"</code> 的列并通过 <code>#expand</code> 插槽自定义展开内容。</p>
    <code-preview :source="expandSource" :demo="ExpandTable" />

    <!-- ==================== 固定列 ==================== -->
    <h2 id="fixed-column">固定列</h2>
    <p>设置 <code>fixed="left"</code> 或 <code>fixed="right"</code> 可将列固定在左侧或右侧。横向内容超出时固定列始终可见。</p>
    <code-preview :source="fixedSource" :demo="FixedTable" />

    <!-- ==================== 合计行 ==================== -->
    <h2 id="summary-row">合计行</h2>
    <p>设置 <code>show-summary</code> 显示合计行。可通过 <code>summary-method</code> 自定义合计逻辑。</p>
    <code-preview :source="summarySource" :demo="SummaryTable" />

    <!-- ==================== 自定义列模板 ==================== -->
    <h2 id="custom-column-template">自定义列模板</h2>
    <p>通过 <code>#default="{ row }"</code> 插槽自定义列单元格内容，通过 <code>#header</code> 插槽自定义表头。</p>
    <code-preview :source="customColSource" :demo="CustomColumnTable" />

    <!-- ==================== 合并单元格 ==================== -->
    <h2 id="span-method">合并单元格</h2>
    <p>通过 <code>span-method</code> 属性指定一个合并方法，该方法返回 <code>{ rowspan, colspan }</code> 来控制单元格的合并。方法接收 <code>{ row, column, rowIndex, columnIndex }</code> 四个参数。</p>
    <code-preview :source="spanSource" :demo="SpanTable" />

    <!-- ==================== 行编辑 ==================== -->
    <h2 id="inline-edit">行编辑</h2>
    <p>通过自定义列模板插槽，结合 <code>__editing</code> 标记实现行内编辑。点击"编辑"进入编辑模式，保存/取消切换回展示模式，支持新增行和批量保存。</p>
    <code-preview :source="inlineEditSource" :demo="InlineEditTable" />

    <!-- ==================== 虚拟滚动 ==================== -->
    <h2 id="virtual-scroll">虚拟滚动</h2>
    <p>设置 <code>virtual-scroll</code> 启用虚拟滚动，仅渲染可视区域内的行，支持动态行高。通过 <code>estimated-row-height</code> 设置估算行高，<code>overscan-count</code> 控制缓冲区行数。适合处理 10000+ 行的大数据量场景。</p>
    <code-preview :source="virtualScrollSource" :demo="VirtualScrollTable" />

    <!-- ==================== 表单编辑 ==================== -->
    <h2 id="form-table">表单编辑</h2>
    <p>设置 <code>form</code> prop 启用表单编辑模式，支持 <code>batch</code>（批量编辑）、<code>always</code>（始终编辑）、<code>row</code>（行切换）三种模式。在列上声明 <code>editor</code> 和 <code>:rules</code> 即可自动渲染 Element 组件和校验。</p>
    <code-preview :source="formTableSource" :demo="FormTable" />

    <!-- ==================== Table API ==================== -->
    <h2 id="table-api">Table API</h2>

    <api-table id="table-attributes" title="Table Attributes" :headers="propHeaders" :data="tableProps" />
    <api-table id="table-events" title="Table Events" :headers="eventHeaders" :data="tableEvents" />
    <api-table id="table-methods" title="Table Methods (Exposes)" :headers="methodHeaders" :data="tableMethods" />
    <api-table id="table-slots" title="Table Slots" :headers="slotHeaders" :data="tableSlots" />

    <!-- ==================== Table-column API ==================== -->
    <h2 id="table-column-api">Table-column API</h2>

    <api-table id="table-column-attributes" title="Table-column Attributes" :headers="propHeaders" :data="columnProps" />
    <api-table id="table-column-slots" title="Table-column Slots" :headers="slotHeaders" :data="columnSlots" />
  </div>
</template>

<script>
import CodePreview from '../../components/CodePreview.vue'
import ApiTable from '../../components/ApiTable.vue'

import BasicTable from './demos/BasicTable.vue'
import basicSource from './demos/BasicTable.vue?raw'

import StatusTable from './demos/StatusTable.vue'
import statusSource from './demos/StatusTable.vue?raw'

import SelectionTable from './demos/SelectionTable.vue'
import selectionSource from './demos/SelectionTable.vue?raw'

import SortTable from './demos/SortTable.vue'
import sortSource from './demos/SortTable.vue?raw'

import CustomSortTable from './demos/CustomSortTable.vue'
import customSortSource from './demos/CustomSortTable.vue?raw'

import FilterTable from './demos/FilterTable.vue'
import filterSource from './demos/FilterTable.vue?raw'

import FilterRowTable from './demos/FilterRowTable.vue'
import filterRowSource from './demos/FilterRowTable.vue?raw'

import ExpandTable from './demos/ExpandTable.vue'
import expandSource from './demos/ExpandTable.vue?raw'

import FixedTable from './demos/FixedTable.vue'
import fixedSource from './demos/FixedTable.vue?raw'

import SummaryTable from './demos/SummaryTable.vue'
import summarySource from './demos/SummaryTable.vue?raw'

import CustomColumnTable from './demos/CustomColumnTable.vue'
import customColSource from './demos/CustomColumnTable.vue?raw'

import SpanTable from './demos/SpanTable.vue'
import spanSource from './demos/SpanTable.vue?raw'

import InlineEditTable from './demos/InlineEditTable.vue'
import inlineEditSource from './demos/InlineEditTable.vue?raw'

import VirtualScrollTable from './demos/VirtualScrollTable.vue'
import virtualScrollSource from './demos/VirtualScrollTable.vue?raw'

import FormTable from './demos/FormTable.vue'
import formTableSource from './demos/FormTable.vue?raw'

export default {
  components: { CodePreview, ApiTable },
  data() {
    return {
      // 源码（?raw 导入）
      basicSource,
      statusSource,
      selectionSource,
      sortSource,
      customSortSource,
      filterSource,
      filterRowSource,
      expandSource,
      fixedSource,
      summarySource,
      customColSource,
      spanSource,
      inlineEditSource,
      virtualScrollSource,
      formTableSource,

      // 组件
      BasicTable,
      StatusTable,
      SelectionTable,
      SortTable,
      CustomSortTable,
      FilterTable,
      FilterRowTable,
      ExpandTable,
      FixedTable,
      SummaryTable,
      CustomColumnTable,
      SpanTable,
      InlineEditTable,
      VirtualScrollTable,
      FormTable,

      // ==================== API 文档 ====================
      propHeaders: ['名称', '说明', '类型', '默认值'],
      eventHeaders: ['名称', '说明', '参数'],
      methodHeaders: ['名称', '说明', '参数'],
      slotHeaders: ['名称', '说明', '作用域'],

      tableProps: [
        { '名称': 'data', '说明': '表格数据', '类型': 'Array', '默认值': '—' },
        { '名称': 'height', '说明': '表格高度（数值为 px，字符串可为 CSS 值）', '类型': 'String / Number', '默认值': '—' },
        { '名称': 'max-height', '说明': '表格最大高度', '类型': 'String / Number', '默认值': '—' },
        { '名称': 'stripe', '说明': '是否显示斑马纹', '类型': 'Boolean', '默认值': 'false' },
        { '名称': 'border', '说明': '是否显示纵向边框', '类型': 'Boolean', '默认值': 'false' },
        { '名称': 'size', '说明': '表格尺寸', '类型': 'String', '默认值': '—' },
        { '名称': 'fit', '说明': '列宽是否自适应容器宽度', '类型': 'Boolean', '默认值': 'true' },
        { '名称': 'show-header', '说明': '是否显示表头', '类型': 'Boolean', '默认值': 'true' },
        { '名称': 'highlight-current-row', '说明': '是否高亮当前行', '类型': 'Boolean', '默认值': 'false' },
        { '名称': 'current-row-key', '说明': '当前行的 key（只写属性）', '类型': 'String / Number', '默认值': '—' },
        { '名称': 'row-class-name', '说明': '行自定义类名', '类型': 'Function({row, rowIndex}) / String', '默认值': '—' },
        { '名称': 'row-style', '说明': '行自定义样式', '类型': 'Function({row, rowIndex}) / Object', '默认值': '—' },
        { '名称': 'cell-class-name', '说明': '单元格自定义类名', '类型': 'Function({row, column, rowIndex, columnIndex}) / String', '默认值': '—' },
        { '名称': 'cell-style', '说明': '单元格自定义样式', '类型': 'Function / Object', '默认值': '—' },
        { '名称': 'header-row-class-name', '说明': '表头行自定义类名', '类型': 'Function / String', '默认值': '—' },
        { '名称': 'header-row-style', '说明': '表头行自定义样式', '类型': 'Function / Object', '默认值': '—' },
        { '名称': 'header-cell-class-name', '说明': '表头单元格自定义类名', '类型': 'Function / String', '默认值': '—' },
        { '名称': 'header-cell-style', '说明': '表头单元格自定义样式', '类型': 'Function / Object', '默认值': '—' },
        { '名称': 'show-filter-row', '说明': '是否显示筛选行（插槽 #filter-cell）', '类型': 'Boolean', '默认值': 'false' },
        { '名称': 'filter-row-class-name', '说明': '筛选行自定义类名', '类型': 'Function({rowIndex}) / String', '默认值': '—' },
        { '名称': 'filter-row-style', '说明': '筛选行自定义样式', '类型': 'Function({rowIndex}) / Object', '默认值': '—' },
        { '名称': 'filter-cell-class-name', '说明': '筛选单元格自定义类名', '类型': 'Function({column, columnIndex, $index}) / String', '默认值': '—' },
        { '名称': 'filter-cell-style', '说明': '筛选单元格自定义样式', '类型': 'Function({column, columnIndex, $index}) / Object', '默认值': '—' },
        { '名称': 'row-key', '说明': '行唯一标识 key（树形数据/保留选中必填）', '类型': 'Function(row) / String', '默认值': '—' },
        { '名称': 'empty-text', '说明': '数据为空时显示的文本（可用 #empty 插槽替代）', '类型': 'String', '默认值': '"暂无数据"' },
        { '名称': 'default-expand-all', '说明': '是否默认展开所有行', '类型': 'Boolean', '默认值': 'false' },
        { '名称': 'expand-row-keys', '说明': '控制展开的行（需配合 row-key）', '类型': 'Array', '默认值': '—' },
        { '名称': 'default-sort', '说明': '默认排序 { prop, order }', '类型': 'Object', '默认值': '—' },
        { '名称': 'tooltip-effect', '说明': '溢出 tooltip 效果主题', '类型': 'String', '默认值': '"dark"' },
        { '名称': 'tooltip-options', '说明': '溢出 tooltip 额外选项', '类型': 'Object', '默认值': '—' },
        { '名称': 'show-summary', '说明': '是否显示合计行', '类型': 'Boolean', '默认值': 'false' },
        { '名称': 'sum-text', '说明': '合计行第一列文本', '类型': 'String', '默认值': '"合计"' },
        { '名称': 'summary-method', '说明': '自定义合计方法 ({ columns, data })', '类型': 'Function', '默认值': '—' },
        { '名称': 'span-method', '说明': '单元格合并方法 ({ row, column, rowIndex, columnIndex })', '类型': 'Function', '默认值': '—' },
        { '名称': 'select-on-indeterminate', '说明': '半选时表头复选框行为', '类型': 'Boolean', '默认值': 'true' },
        { '名称': 'indent', '说明': '树形数据缩进量（px）', '类型': 'Number', '默认值': '16' },
        { '名称': 'lazy', '说明': '是否懒加载子节点', '类型': 'Boolean', '默认值': 'false' },
        { '名称': 'load', '说明': '懒加载方法 (row, treeNode, resolve)', '类型': 'Function', '默认值': '—' },
        { '名称': 'tree-props', '说明': '树形数据字段映射', '类型': 'Object', '默认值': '{hasChildren, children}' },
        { '名称': 'table-layout', '说明': '表格布局算法', '类型': 'String', '默认值': '"fixed"' },
        { '名称': 'scrollbar-always-on', '说明': '是否始终显示滚动条', '类型': 'Boolean', '默认值': 'false' },
        { '名称': 'flexible', '说明': '主轴最小宽度不跟随内容', '类型': 'Boolean', '默认值': 'false' },
        { '名称': 'virtual-scroll', '说明': '是否启用虚拟滚动（需配合 height 或 max-height 使用）', '类型': 'Boolean', '默认值': 'false' },
        { '名称': 'estimated-row-height', '说明': '虚拟滚动模式下的估算行高（px），用于初始位置计算', '类型': 'Number', '默认值': '48' },
        { '名称': 'overscan-count', '说明': '虚拟滚动模式下可见区域外预渲染的行数', '类型': 'Number', '默认值': '5' },
      ],

      tableEvents: [
        { '名称': 'select', '说明': '用户点击行复选框时触发', '参数': '(selection, row)' },
        { '名称': 'select-all', '说明': '用户点击表头全选时触发', '参数': '(selection)' },
        { '名称': 'selection-change', '说明': '选择项发生变化时触发', '参数': '(selection)' },
        { '名称': 'cell-mouse-enter', '说明': '鼠标进入单元格', '参数': '(row, column, cell, event)' },
        { '名称': 'cell-mouse-leave', '说明': '鼠标离开单元格', '参数': '(row, column, cell, event)' },
        { '名称': 'cell-click', '说明': '点击单元格时触发', '参数': '(row, column, cell, event)' },
        { '名称': 'cell-dblclick', '说明': '双击单元格时触发', '参数': '(row, column, cell, event)' },
        { '名称': 'cell-contextmenu', '说明': '右键点击单元格', '参数': '(row, column, cell, event)' },
        { '名称': 'row-click', '说明': '点击行时触发', '参数': '(row, column, event)' },
        { '名称': 'row-contextmenu', '说明': '右键点击行时触发', '参数': '(row, column, event)' },
        { '名称': 'row-dblclick', '说明': '双击行时触发', '参数': '(row, column, event)' },
        { '名称': 'header-click', '说明': '点击列头时触发', '参数': '(column, event)' },
        { '名称': 'header-contextmenu', '说明': '右键点击列头时触发', '参数': '(column, event)' },
        { '名称': 'sort-change', '说明': '排序条件变化时触发', '参数': '({ column, prop, order })' },
        { '名称': 'filter-change', '说明': '筛选条件变化时触发（需设置 column-key）', '参数': '(filters)' },
        { '名称': 'current-change', '说明': '当前行变化时触发', '参数': '(currentRow, oldCurrentRow)' },
        { '名称': 'header-dragend', '说明': '列宽拖拽结束后触发', '参数': '(newWidth, oldWidth, column, event)' },
        { '名称': 'expand-change', '说明': '行展开/收起时触发', '参数': '(row, expandedRows)' },
        { '名称': 'scroll', '说明': '表格滚动时触发', '参数': '({ scrollLeft, scrollTop })' },
      ],

      tableMethods: [
        { '名称': 'clearSelection', '说明': '清空所有选中行', '参数': '—' },
        { '名称': 'getSelectionRows', '说明': '返回当前选中的行数组', '参数': '—' },
        { '名称': 'toggleRowSelection', '说明': '切换某行的选中状态', '参数': '(row, selected?)' },
        { '名称': 'toggleAllSelection', '说明': '切换全选/全不选', '参数': '—' },
        { '名称': 'toggleRowExpansion', '说明': '切换某行的展开状态', '参数': '(row, expanded?)' },
        { '名称': 'setCurrentRow', '说明': '设置当前行（单选）。不传参则清空', '参数': '(row?)' },
        { '名称': 'clearSort', '说明': '清空排序条件，恢复原始顺序', '参数': '—' },
        { '名称': 'clearFilter', '说明': '清空筛选条件。不传参则清除所有', '参数': '(columnKeys?)' },
        { '名称': 'doLayout', '说明': '刷新表格布局（表格可见性变化时调用）', '参数': '—' },
        { '名称': 'sort', '说明': '手动排序', '参数': '(prop, order)' },
        { '名称': 'scrollTo', '说明': '滚动到指定位置', '参数': '(options | yCoord, yCoord?)' },
        { '名称': 'setScrollTop', '说明': '设置垂直滚动位置', '参数': '(top)' },
        { '名称': 'setScrollLeft', '说明': '设置水平滚动位置', '参数': '(left)' },
      ],

      tableSlots: [
        { '名称': 'default', '说明': '默认内容，放置 table-column 子组件', '作用域': '—' },
        { '名称': 'append', '说明': '表格最后一行之后插入的内容（位于合计行之上）', '作用域': '—' },
        { '名称': 'empty', '说明': '数据为空时的自定义内容', '作用域': '—' },
        { '名称': 'expand', '说明': '展开行内容（配合 type="expand"）', '作用域': '{ row, expanded }' },
      ],

      columnProps: [
        { '名称': 'type', '说明': '列类型：selection / index / expand', '类型': 'String', '默认值': '"default"' },
        { '名称': 'index', '说明': '自定义行索引（type="index" 时有效）', '类型': 'Number / Function(index)', '默认值': '—' },
        { '名称': 'label', '说明': '列标签 / 表头文本', '类型': 'String', '默认值': '—' },
        { '名称': 'column-key', '说明': '列的 key（filter-change 事件需要此属性）', '类型': 'String', '默认值': '—' },
        { '名称': 'prop / property', '说明': '对应数据字段名', '类型': 'String', '默认值': '—' },
        { '名称': 'width', '说明': '列宽度', '类型': 'String / Number', '默认值': '" "' },
        { '名称': 'min-width', '说明': '列最小宽度（按比例分配剩余空间）', '类型': 'String / Number', '默认值': '" "' },
        { '名称': 'fixed', '说明': '固定列：true / "left" / "right"', '类型': 'Boolean / String', '默认值': 'false' },
        { '名称': 'render-header', '说明': '自定义表头渲染函数 ({ column, $index })', '类型': 'Function', '默认值': '—' },
        { '名称': 'sortable', '说明': '是否可排序。"custom" 用于远程排序', '类型': 'Boolean / String', '默认值': 'false' },
        { '名称': 'sort-method', '说明': '自定义排序方法 (a, b) => number', '类型': 'Function', '默认值': '—' },
        { '名称': 'sort-by', '说明': '指定排序依据的属性', '类型': 'Function / String / Array', '默认值': '—' },
        { '名称': 'sort-orders', '说明': '排序策略切换顺序', '类型': 'Array', '默认值': "['ascending','descending',null]" },
        { '名称': 'resizable', '说明': '列宽是否可拖拽调整（需 table 开启 border）', '类型': 'Boolean', '默认值': 'true' },
        { '名称': 'formatter', '说明': '单元格内容格式化 (row, column, cellValue, index)', '类型': 'Function', '默认值': '—' },
        { '名称': 'show-overflow-tooltip', '说明': '内容溢出时显示 tooltip', '类型': 'Boolean / Object', '默认值': 'undefined' },
        { '名称': 'align', '说明': '对齐方式：left / center / right', '类型': 'String', '默认值': '"left"' },
        { '名称': 'header-align', '说明': '表头对齐方式（未设置时继承 align）', '类型': 'String', '默认值': '—' },
        { '名称': 'class-name', '说明': '该列单元格的自定义类名', '类型': 'String', '默认值': '—' },
        { '名称': 'label-class-name', '说明': '该列表头的自定义类名', '类型': 'String', '默认值': '—' },
        { '名称': 'selectable', '说明': '行是否可选 (row, index) => boolean', '类型': 'Function', '默认值': '—' },
        { '名称': 'reserve-selection', '说明': '刷新数据后是否保留选中（需 row-key）', '类型': 'Boolean', '默认值': 'false' },
        { '名称': 'filters', '说明': '筛选选项：[{text, value}, ...]', '类型': 'Array', '默认值': '—' },
        { '名称': 'filter-placement', '说明': '筛选下拉框的弹出位置', '类型': 'String', '默认值': '—' },
        { '名称': 'filter-class-name', '说明': '筛选下拉框的自定义类名', '类型': 'String', '默认值': '—' },
        { '名称': 'filter-multiple', '说明': '筛选是否支持多选', '类型': 'Boolean', '默认值': 'true' },
        { '名称': 'filter-method', '说明': '自定义筛选方法 (value, row, column)', '类型': 'Function', '默认值': '—' },
        { '名称': 'filtered-value', '说明': '筛选选中值', '类型': 'Array', '默认值': '[]' },
      ],

      columnSlots: [
        { '名称': 'default', '说明': '自定义列单元格内容', '作用域': '{ row, column, $index }' },
        { '名称': 'header', '说明': '自定义列表头内容', '作用域': '{ column, $index }' },
        { '名称': 'filter-cell', '说明': '自定义筛选行单元格内容（需 table 开启 show-filter-row）', '作用域': '{ column, $index }' },
      ],
    }
  },
}
</script>
