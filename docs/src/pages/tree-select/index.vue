<template>
  <div class="page">
    <h1 id="tree-select">TreeSelect 树形选择器</h1>
    <p>下拉框内嵌树形控件，用于在树形结构数据中进行选择。兼容 Element Plus TreeSelect 的 API（value / events / methods / slots）。</p>

    <!-- ==================== 基础用法 ==================== -->
    <h2 id="basic">基础用法</h2>
    <p>使用 <code>data</code> 绑定树形数据，<code>v-model</code> 绑定选中节点的主键（默认 <code>value</code> 字段）。</p>
    <code-preview :source="basicSource" :demo="BasicTreeSelect" />

    <!-- ==================== 多选 ==================== -->
    <h2 id="multiple">多选 / 复选框</h2>
    <p>设置 <code>multiple</code> 或 <code>show-checkbox</code> 开启多选；<code>collapse-tags</code> 折叠多余的 tag。</p>
    <code-preview :source="multipleSource" :demo="MultipleTreeSelect" />

    <!-- ==================== 可搜索 ==================== -->
    <h2 id="filterable">可搜索</h2>
    <p>设置 <code>filterable</code> 开启搜索过滤，默认通过节点 label 进行过滤；也可传入 <code>filter-method</code> 自定义过滤逻辑。</p>
    <code-preview :source="filterableSource" :demo="FilterableTreeSelect" />

    <!-- ==================== 禁用 / 可清空 / 尺寸 ==================== -->
    <h2 id="disabled">禁用 / 可清空 / 尺寸</h2>
    <p>节点数据设置 <code>disabled: true</code> 可禁用选择；<code>clearable</code> 一键清空；<code>size</code> 控制尺寸（large / default / small）。</p>
    <code-preview :source="disabledSource" :demo="DisabledTreeSelect" />

    <!-- ==================== 自定义节点 / 字段映射 ==================== -->
    <h2 id="custom">自定义节点内容与字段映射</h2>
    <p>通过 <code>node-key</code> 与 <code>props</code> 适配自定义数据结构；使用 <code>#default</code> 插槽自定义节点渲染（作用域 <code>{ node, data }</code>）。</p>
    <code-preview :source="customSource" :demo="CustomNodeTreeSelect" />

    <!-- ==================== API ==================== -->
    <h2 id="api">API</h2>
    <api-table id="ts-attributes" title="TreeSelect Attributes" :headers="propHeaders" :data="attributes" />
    <api-table id="ts-events" title="TreeSelect Events" :headers="eventHeaders" :data="events" />
    <api-table id="ts-methods" title="TreeSelect Methods (Exposes)" :headers="methodHeaders" :data="methods" />
    <api-table id="ts-slots" title="TreeSelect Slots" :headers="slotHeaders" :data="slots" />
  </div>
</template>

<script>
import CodePreview from '../../components/CodePreview.vue'
import ApiTable from '../../components/ApiTable.vue'

import BasicTreeSelect from './demos/BasicTreeSelect.vue'
import basicSource from './demos/BasicTreeSelect.vue?raw'

import MultipleTreeSelect from './demos/MultipleTreeSelect.vue'
import multipleSource from './demos/MultipleTreeSelect.vue?raw'

import FilterableTreeSelect from './demos/FilterableTreeSelect.vue'
import filterableSource from './demos/FilterableTreeSelect.vue?raw'

import DisabledTreeSelect from './demos/DisabledTreeSelect.vue'
import disabledSource from './demos/DisabledTreeSelect.vue?raw'

import CustomNodeTreeSelect from './demos/CustomNodeTreeSelect.vue'
import customSource from './demos/CustomNodeTreeSelect.vue?raw'

export default {
  components: { CodePreview, ApiTable },
  data() {
    return {
      BasicTreeSelect,
      MultipleTreeSelect,
      FilterableTreeSelect,
      DisabledTreeSelect,
      CustomNodeTreeSelect,
      basicSource,
      multipleSource,
      filterableSource,
      disabledSource,
      customSource,

      propHeaders: ['名称', '说明', '类型', '默认值'],
      eventHeaders: ['名称', '说明', '参数'],
      methodHeaders: ['名称', '说明', '参数'],
      slotHeaders: ['名称', '说明', '作用域'],

      attributes: [
        { '名称': 'value / v-model', '说明': '绑定值，单选为主键，多选为主键数组', '类型': 'string / number / boolean / array / object', '默认值': '—' },
        { '名称': 'data', '说明': '树形数据', '类型': 'array', '默认值': '[]' },
        { '名称': 'node-key', '说明': '节点主键字段（每个节点的唯一标识）', '类型': 'string', '默认值': '"value"' },
        { '名称': 'props', '说明': '数据字段映射 { label, children, disabled, class }', '类型': 'object', '默认值': '{ label, children, disabled }' },
        { '名称': 'multiple', '说明': '是否多选', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'show-checkbox', '说明': '是否显示复选框（开启即多选）', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'check-strictly', '说明': '父子节点勾选不联动', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'collapse-tags', '说明': '多选时折叠 tag', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'collapse-tags-tooltip', '说明': '折叠时 hover 显示全部已选', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'max-collapse-tags', '说明': '折叠时最多展示的 tag 数量', '类型': 'number', '默认值': '1' },
        { '名称': 'multiple-limit', '说明': '多选最大数量，0 不限制', '类型': 'number', '默认值': '0' },
        { '名称': 'filterable', '说明': '是否可搜索', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'filter-method', '说明': '自定义过滤方法，接收输入值返回新数据', '类型': 'function(value)', '默认值': '—' },
        { '名称': 'filter-node-method', '说明': '节点级过滤方法（默认走 tree.filter）', '类型': 'function(value, data)', '默认值': '—' },
        { '名称': 'clearable', '说明': '是否可清空', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'disabled', '说明': '是否禁用', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'size', '说明': '尺寸：large / default / small', '类型': 'string', '默认值': '"default"' },
        { '名称': 'placeholder', '说明': '占位文本', '类型': 'string', '默认值': '"请选择"' },
        { '名称': 'default-expand-all', '说明': '是否默认展开全部节点', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'expand-on-click-node', '说明': '点击节点是否展开/收起', '类型': 'boolean', '默认值': 'true' },
        { '名称': 'check-on-click-node', '说明': '点击节点是否勾选（多选）', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'default-expanded-keys', '说明': '默认展开节点的主键数组', '类型': 'array', '默认值': '[]' },
        { '名称': 'default-checked-keys', '说明': '默认勾选节点的主键数组', '类型': 'array', '默认值': '[]' },
        { '名称': 'current-node-key', '说明': '当前节点主键', '类型': 'string / number', '默认值': '—' },
        { '名称': 'highlight-current', '说明': '是否高亮当前节点', '类型': 'boolean', '默认值': 'true' },
        { '名称': 'accordion', '说明': '手风琴模式（同级只展开一个）', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'indent', '说明': '层级缩进（px）', '类型': 'number', '默认值': '16' },
        { '名称': 'icon-class', '说明': '节点展开图标类名', '类型': 'string', '默认值': '—' },
        { '名称': 'lazy', '说明': '是否懒加载子节点', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'load', '说明': '懒加载方法 (node, resolve)', '类型': 'function', '默认值': '—' },
        { '名称': 'render-after-expand', '说明': '兼容属性（element-ui tree 始终预渲染）', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'empty-text', '说明': '数据为空时的文本', '类型': 'string', '默认值': '"暂无数据"' },
        { '名称': 'no-data-text', '说明': '无数据文本（select 语义别名）', '类型': 'string', '默认值': '"暂无数据"' },
        { '名称': 'no-match-text', '说明': '搜索无匹配时的文本', '类型': 'string', '默认值': '"无匹配数据"' },
        { '名称': 'value-key', '说明': '对象值唯一标识（对齐 el-select）', '类型': 'string', '默认值': '"value"' },
        { '名称': 'popper-class', '说明': '下拉框自定义类名', '类型': 'string', '默认值': '—' },
        { '名称': 'loading', '说明': '是否加载中', '类型': 'boolean', '默认值': 'false' },
        { '名称': 'placement', '说明': '下拉弹出位置', '类型': 'string', '默认值': '"bottom-start"' },
      ],

      events: [
        { '名称': 'change', '说明': '值变化时触发', '参数': '(value, dataOrNodes)' },
        { '名称': 'visible-change', '说明': '下拉显隐变化时触发', '参数': '(visible)' },
        { '名称': 'clear', '说明': '点击清空按钮时触发', '参数': '—' },
        { '名称': 'blur', '说明': '失去焦点时触发', '参数': '(event)' },
        { '名称': 'focus', '说明': '获得焦点时触发', '参数': '(event)' },
        { '名称': 'node-click', '说明': '点击节点时触发', '参数': '(data, node, component)' },
        { '名称': 'node-contextmenu', '说明': '右键点击节点', '参数': '(event, data, node)' },
        { '名称': 'check', '说明': '复选框勾选状态变化', '参数': '(data, { checkedKeys, checkedNodes, ... })' },
        { '名称': 'check-change', '说明': '节点勾选状态变化', '参数': '(data, checked, indeterminate)' },
        { '名称': 'current-change', '说明': '当前节点变化', '参数': '(data, node)' },
        { '名称': 'node-expand', '说明': '节点展开', '参数': '(data, node, component)' },
        { '名称': 'node-collapse', '说明': '节点收起', '参数': '(data, node, component)' },
      ],

      methods: [
        { '名称': 'focus', '说明': '聚焦输入框', '参数': '—' },
        { '名称': 'blur', '说明': '失焦并关闭下拉', '参数': '—' },
        { '名称': 'getTree', '说明': '获取内部 el-tree 实例', '参数': '—' },
        { '名称': 'getNode', '说明': '获取节点', '参数': '(data)' },
        { '名称': 'getCurrentKey', '说明': '获取当前节点主键', '参数': '—' },
        { '名称': 'getCurrentNode', '说明': '获取当前节点数据', '参数': '—' },
        { '名称': 'setCurrentKey', '说明': '设置当前节点', '参数': '(key)' },
        { '名称': 'getCheckedKeys', '说明': '获取勾选主键', '参数': '(leafOnly)' },
        { '名称': 'getCheckedNodes', '说明': '获取勾选节点', '参数': '(leafOnly, includeHalfChecked)' },
        { '名称': 'setCheckedKeys', '说明': '设置勾选主键', '参数': '(keys, leafOnly)' },
        { '名称': 'setCheckedNodes', '说明': '设置勾选节点', '参数': '(nodes, leafOnly)' },
        { '名称': 'setChecked', '说明': '设置节点勾选状态', '参数': '(data, checked, deep)' },
        { '名称': 'getHalfCheckedNodes', '说明': '获取半选节点', '参数': '—' },
        { '名称': 'getHalfCheckedKeys', '说明': '获取半选主键', '参数': '—' },
        { '名称': 'getNodePath', '说明': '获取节点路径', '参数': '(data)' },
        { '名称': 'updateKeyChildren', '说明': '更新子节点', '参数': '(key, data)' },
        { '名称': 'filter', '说明': '手动过滤', '参数': '(value)' },
      ],

      slots: [
        { '名称': 'default', '说明': '自定义节点内容', '作用域': '{ node, data }' },
        { '名称': 'prefix', '说明': '输入框前缀内容', '作用域': '—' },
        { '名称': 'empty', '说明': '无数据时的内容', '作用域': '—' },
      ],
    }
  },
}
</script>

<!-- Demo 辅助样式 — 全局，供各 demo 组件使用 -->
<style lang="scss">
.demo-result {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--text-color-light, #909399);
}
.demo-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: flex-start;
}
.demo-label {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--text-color-light, #909399);
}
.custom-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  i {
    color: var(--brand-color, #409eff);
  }
}
</style>
