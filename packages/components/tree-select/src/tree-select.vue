<template>
  <div
    class="v2-tree-select"
    :class="[
      `v2-tree-select--${size}`,
      {
        'is-disabled': disabled,
        'is-visible': visible,
        'is-multiple': isMultiple,
        'is-filterable': filterable,
        'is-focus': inputFocused,
        'has-value': hasValue,
      },
    ]"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <el-popover
      ref="popover"
      v-model="visible"
      :placement="placement"
      :popper-class="['v2-tree-select__popper', popperClass].join(' ')"
      :width="popoverWidth"
      trigger="manual"
      :append-to-body="true"
      :transition="transition"
      :offset="0"
      @show="handlePopoverShow"
      @hide="handlePopoverHide"
    >
      <!-- ==================== 下拉树面板 ==================== -->
      <div class="v2-tree-select__dropdown" :style="{ maxHeight: dropdownMaxHeight }">
        <div v-if="loading" class="v2-tree-select__loading">{{ loadingText }}</div>

        <template v-else>
          <el-tree
            v-show="!isNotFound"
            ref="tree"
            :data="displayData"
            :props="normalizedProps"
            :node-key="effectiveNodeKey"
            :show-checkbox="showCheckbox || multiple"
            :check-strictly="checkStrictly"
            :default-expand-all="defaultExpandAll"
            :expand-on-click-node="expandOnClickNode"
            :check-on-click-node="checkOnClickNode"
            :default-expanded-keys="defaultExpandedKeys"
            :default-checked-keys="defaultCheckedKeys"
            :current-node-key="currentNodeKey"
            :highlight-current="highlightCurrent"
            :filter-node-method="filterNodeMethod"
            :accordion="accordion"
            :indent="indent"
            :icon-class="iconClass"
            :lazy="lazy"
            :load="load"
            :draggable="draggable"
            :empty-text="emptyText"
            :render-content="renderContent"
            :allow-drag="allowDrag"
            :allow-drop="allowDrop"
            @node-click="handleNodeClick"
            @node-contextmenu="handleNodeContextMenu"
            @check="handleCheck"
            @check-change="handleCheckChange"
            @current-change="handleCurrentChange"
            @node-expand="handleNodeExpand"
            @node-collapse="handleNodeCollapse"
            @node-drag-start="(...args) => $emit('node-drag-start', ...args)"
            @node-drag-enter="(...args) => $emit('node-drag-enter', ...args)"
            @node-drag-leave="(...args) => $emit('node-drag-leave', ...args)"
            @node-drag-over="(...args) => $emit('node-drag-over', ...args)"
            @node-drag-end="(...args) => $emit('node-drag-end', ...args)"
            @node-drop="(...args) => $emit('node-drop', ...args)"
          >
            <!-- 透传默认作用域插槽用于自定义节点内容；未传入时回退显示 node.label -->
            <template slot-scope="{ node, data: nodeData }">
              <slot :node="node" :data="nodeData">
                <span class="v2-tree-select__node-label">{{ node.label }}</span>
              </slot>
            </template>
          </el-tree>

          <!-- 搜索无匹配（el-tree 的 empty-text 已兜底空数据场景） -->
          <div v-if="isNotFound" class="v2-tree-select__empty">{{ noMatchText }}</div>
        </template>
      </div>

      <!-- ==================== 触发器外壳 ==================== -->
      <div slot="reference" class="v2-tree-select__reference" @click="toggleMenu">
        <!-- 前缀插槽 -->
        <span v-if="$slots.prefix" class="v2-tree-select__prefix">
          <slot name="prefix" />
        </span>

        <div class="v2-tree-select__control">
          <!-- 多选 tags（按 key 精确渲染与移除） -->
          <div v-if="isMultiple && selectedKeys.length" class="v2-tree-select__tags">
            <span
              v-for="(key, index) in displayTags"
              :key="key"
              class="v2-tree-select__tag"
            >
              <span class="v2-tree-select__tag-text">{{ displayTagLabels[index] }}</span>
              <i
                v-if="!disabled"
                class="v2-tree-select__tag-close el-icon-close"
                @click.stop="removeTagByKey(key)"
              ></i>
            </span>
            <el-tooltip
              v-if="collapseTagsTooltip && collapseRest > 0"
              effect="dark"
              placement="top"
            >
              <span class="v2-tree-select__count">+{{ collapseRest }}</span>
              <template slot="content">
                <div class="v2-tree-select__tags-tooltip">
                  <div
                    v-for="(label, index) in selectedLabels"
                    :key="index"
                  >{{ label }}</div>
                </div>
              </template>
            </el-tooltip>
            <span
              v-else-if="collapseRest > 0"
              class="v2-tree-select__count"
            >+{{ collapseRest }}</span>
          </div>

          <!-- 输入框（单选显示值 / 多选过滤 / 可搜索输入） -->
          <input
            ref="input"
            class="v2-tree-select__input"
            :value="inputDisplay"
            :placeholder="inputPlaceholder"
            :disabled="disabled"
            :readonly="inputReadonly"
            :name="name"
            @click.stop="onInputClick"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            @keydown.delete="handleDelete"
          />
        </div>

        <!-- 后缀区：清除 + 箭头 -->
        <span class="v2-tree-select__suffix">
          <i
            v-if="showClearIcon"
            class="v2-tree-select__clear el-icon-circle-close"
            @click.stop="handleClear"
          ></i>
          <i
            v-show="!showClearIcon"
            class="v2-tree-select__caret el-icon-arrow-up"
            :class="{ 'is-reverse': visible }"
          ></i>
        </span>
      </div>
    </el-popover>
  </div>
</template>

<script>
import {
  normalizeProps,
  buildNodeMap,
  findLabelByKey,
  resolveValueToKeys,
  DEFAULT_NODE_KEY,
} from './selection'

export default {
  name: 'V2TreeSelect',

  props: {
    // ==================== Select 类属性 ====================
    value: { type: [String, Number, Boolean, Array, Object], default: undefined },
    // 是否禁用
    disabled: { type: Boolean, default: false },
    // 尺寸
    size: { type: String, default: 'default' },
    // 是否可清空
    clearable: { type: Boolean, default: false },
    // 清除图标
    clearIcon: { type: String, default: 'el-icon-circle-close' },
    // 占位文本
    placeholder: { type: String, default: '请选择' },
    // 是否多选
    multiple: { type: Boolean, default: false },
    // 是否折叠 tag
    collapseTags: { type: Boolean, default: false },
    // 折叠时 hover 显示全部
    collapseTagsTooltip: { type: Boolean, default: false },
    // 折叠时最多展示 tag 数量
    maxCollapseTags: { type: Number, default: 1 },
    // 多选最大数量，0 不限制
    multipleLimit: { type: Number, default: 0 },
    // 是否可搜索
    filterable: { type: Boolean, default: false },
    // 自定义过滤方法（接收输入值，改写 data）
    filterMethod: { type: Function, default: null },
    // 无数据文本
    noDataText: { type: String, default: '暂无数据' },
    // 无匹配文本
    noMatchText: { type: String, default: '无匹配数据' },
    // 对象值唯一标识（对齐 el-select value-key）
    valueKey: { type: String, default: 'value' },
    // 下拉自定义类名
    popperClass: { type: String, default: '' },
    // 加载中
    loading: { type: Boolean, default: false },
    loadingText: { type: String, default: '加载中...' },
    // 自动展开（focus 时）
    automaticDropdown: { type: Boolean, default: false },
    // 原生 name 属性
    name: { type: String, default: '' },
    // 弹出位置
    placement: { type: String, default: 'bottom-start' },
    // 过渡动画名
    transition: { type: String, default: 'el-zoom-in-top' },

    // ==================== Tree 类属性 ====================
    // 树数据
    data: { type: Array, default: () => [] },
    // 节点主键字段（默认 value，对齐 element-plus tree-select）
    nodeKey: { type: String, default: DEFAULT_NODE_KEY },
    // 字段映射
    props: { type: Object, default: () => ({}) },
    // 渲染后展开（element-ui tree 始终预渲染，此属性仅做 API 兼容）
    renderAfterExpand: { type: Boolean, default: false },
    // 是否显示复选框
    showCheckbox: { type: Boolean, default: false },
    // 父子节点不联动
    checkStrictly: { type: Boolean, default: false },
    // 默认展开全部
    defaultExpandAll: { type: Boolean, default: false },
    // 点击节点展开
    expandOnClickNode: { type: Boolean, default: true },
    // 点击节点勾选（仅多选）
    checkOnClickNode: { type: Boolean, default: false },
    // 默认展开节点
    defaultExpandedKeys: { type: Array, default: () => [] },
    // 默认勾选节点
    defaultCheckedKeys: { type: Array, default: () => [] },
    // 当前节点 key
    currentNodeKey: { type: [String, Number], default: undefined },
    // 高亮当前节点
    highlightCurrent: { type: Boolean, default: true },
    // 节点过滤方法（默认按 label 字段包含匹配，避免 filterable 未传时抛错）
    filterNodeMethod: {
      type: Function,
      default(value, data) {
        if (!value) return true
        return String(data.label || '').indexOf(value) !== -1
      },
    },
    // 手风琴模式
    accordion: { type: Boolean, default: false },
    // 缩进
    indent: { type: Number, default: 16 },
    // 节点图标
    iconClass: { type: String, default: '' },
    // 懒加载
    lazy: { type: Boolean, default: false },
    // 懒加载函数
    load: { type: Function, default: null },
    // 是否可拖拽
    draggable: { type: Boolean, default: false },
    // 空文本
    emptyText: { type: String, default: '暂无数据' },
    // 渲染函数
    renderContent: { type: Function, default: null },
    // 拖拽判断
    allowDrag: { type: Function, default: null },
    allowDrop: { type: Function, default: null },
    // 下拉最大高度
    dropdownMaxHeight: { type: String, default: '300px' },
  },

  data() {
    return {
      visible: false,
      hovering: false,
      inputFocused: false,
      query: '',
      // 内部 data 副本（filterMethod 改写时使用）
      innerData: null,
      popoverWidth: 200,
    }
  },

  computed: {
    // 规范化字段映射
    normalizedProps() {
      return normalizeProps(this.props)
    },

    // 实际生效的主键字段
    effectiveNodeKey() {
      return this.nodeKey || DEFAULT_NODE_KEY
    },

    // 当前展示的数据（filterMethod 模式下使用 innerData）
    displayData() {
      if (this.filterMethod && this.innerData) {
        return this.innerData
      }
      return this.data
    },

    // 是否多选
    isMultiple() {
      return this.multiple || this.showCheckbox
    },

    // 节点索引表
    nodeMap() {
      return buildNodeMap(this.data, this.effectiveNodeKey, this.props)
    },

    // 选中主键数组
    selectedKeys() {
      return resolveValueToKeys(this.value, this.valueKey)
    },

    // 是否有值
    hasValue() {
      return this.selectedKeys.length > 0
    },

    // 是否有数据
    hasData() {
      return Array.isArray(this.displayData) && this.displayData.length > 0
    },

    // 选中节点 label 列表
    selectedLabels() {
      return this.selectedKeys.map((key) =>
        findLabelByKey(this.nodeMap, key, this.props)
      )
    },

    // 单选当前 label
    currentLabel() {
      if (!this.isMultiple) {
        return findLabelByKey(this.nodeMap, this.selectedKeys[0], this.props)
      }
      return ''
    },

    // 折叠后展示的 tag keys
    displayTags() {
      if (!this.collapseTags) return this.selectedKeys
      return this.selectedKeys.slice(0, this.maxCollapseTags)
    },
    // 折叠后展示的 tag labels
    displayTagLabels() {
      if (!this.collapseTags) return this.selectedLabels
      return this.selectedLabels.slice(0, this.maxCollapseTags)
    },
    // 折叠剩余数量
    collapseRest() {
      if (!this.collapseTags) return 0
      return Math.max(0, this.selectedKeys.length - this.maxCollapseTags)
    },

    // input 是否只读
    inputReadonly() {
      if (this.disabled) return true
      if (this.filterable) return false
      return true
    },

    // input 显示值
    inputDisplay() {
      if (this.filterable) {
        // 可搜索：展开时显示查询词，否则显示当前值（单选）
        if (this.visible) return this.query
        if (!this.isMultiple) return this.currentLabel
        return ''
      }
      // 不可搜索：单选显示值，多选为空（由 tags 展示）
      return this.isMultiple ? '' : this.currentLabel
    },

    // input 占位符
    inputPlaceholder() {
      if (this.isMultiple) {
        // 多选：有值时不再显示占位
        return this.hasValue ? '' : this.placeholder
      }
      // 单选：有值且非搜索态时不显示占位
      if (this.hasValue && !(this.filterable && this.visible)) {
        return ''
      }
      return this.placeholder
    },

    // 是否显示清除图标
    showClearIcon() {
      return (
        this.clearable &&
        !this.disabled &&
        this.hasValue &&
        (this.hovering || this.visible)
      )
    },

    // 是否无匹配（搜索态）
    isNotFound() {
      if (!this.filterable || !this.query) return false
      if (!this.hasData) return false
      // 遍历节点 label 是否存在包含查询词的项
      const labelKey = this.normalizedProps.label
      let matched = false
      this.nodeMap.forEach((node) => {
        if (!matched && String(node[labelKey] || '').includes(this.query)) {
          matched = true
        }
      })
      return !matched
    },
  },

  watch: {
    value: {
      handler() {
        this.syncTreeState()
      },
      deep: true,
    },
    data: {
      handler() {
        // 数据变化后重置过滤副本、重建索引并同步选中态
        this.innerData = null
        this.syncTreeState()
      },
      deep: true,
    },
    visible(val) {
      this.$emit('visible-change', val)
      if (val) {
        this.updatePopoverWidth()
      } else {
        // 关闭时清空查询词
        if (this.filterable) this.query = ''
      }
    },
    query(val) {
      this.handleQueryChange(val)
    },
  },

  mounted() {
    this.syncTreeState()
    this.updatePopoverWidth()
  },

  methods: {
    // 同步 el-tree 的选中/高亮态（受控）
    syncTreeState() {
      const tree = this.$refs.tree
      if (!tree) return
      this.$nextTick(() => {
        const t = this.$refs.tree
        if (!t) return
        if (this.isMultiple) {
          t.setCheckedKeys(this.selectedKeys)
        } else {
          const key = this.selectedKeys[0]
          t.setCurrentKey(key === undefined ? null : key)
        }
      })
    },

    // 切换下拉显隐
    toggleMenu() {
      if (this.disabled) return
      this.visible = !this.visible
    },

    // 输入框点击：可搜索时仅展开不收起，否则走切换逻辑
    // input 占据整个触发区，点击事件被 .stop 阻止冒泡，需在此处理
    onInputClick() {
      if (this.disabled) return
      if (this.filterable) {
        this.visible = true
      } else {
        this.visible = !this.visible
      }
    },

    // 处理输入
    handleInput(e) {
      this.query = e.target.value
    },

    // 查询词变化处理
    handleQueryChange(val) {
      if (!this.filterable) return
      // 自定义过滤方法：交由使用者改写 data
      if (this.filterMethod) {
        this.innerData = this.filterMethod(val)
        return
      }
      // 默认走 el-tree 节点过滤
      const tree = this.$refs.tree
      if (tree) {
        tree.filter(val)
      }
    },

    // 节点点击：单选时选中
    handleNodeClick(data, node, component) {
      this.$emit('node-click', data, node, component)
      if (this.isMultiple) return
      const key = data[this.effectiveNodeKey]
      if (key === undefined || key === null) return
      // disabled 节点不可选
      if (node.disabled) return
      this.$emit('input', key)
      this.$emit('change', key, data)
      this.visible = false
      this.query = ''
    },

    // 复选框勾选：多选时更新
    handleCheck(data, params) {
      this.$emit('check', data, params)
      if (!this.isMultiple) return
      const keys = params.checkedKeys || []
      // multipleLimit 限制：超出则回滚
      if (this.multipleLimit > 0 && keys.length > this.multipleLimit) {
        this.syncTreeState()
        return
      }
      const labelKey = this.normalizedProps.label
      const nodes = (params.checkedNodes || []).map((n) => ({
        [this.valueKey]: n[this.effectiveNodeKey],
        [labelKey]: n[labelKey],
      }))
      this.$emit('input', keys)
      this.$emit('change', keys, nodes)
    },

    handleCheckChange(data, checked, indeterminate) {
      this.$emit('check-change', data, checked, indeterminate)
    },

    handleCurrentChange(data, node) {
      this.$emit('current-change', data, node)
    },

    handleNodeExpand(data, node, component) {
      this.$emit('node-expand', data, node, component)
    },

    handleNodeCollapse(data, node, component) {
      this.$emit('node-collapse', data, node, component)
    },

    handleNodeContextMenu(event, data, node) {
      this.$emit('node-contextmenu', event, data, node)
    },

    // 清空
    handleClear() {
      const empty = this.isMultiple ? [] : undefined
      this.$emit('input', empty)
      this.$emit('change', empty, null)
      this.$emit('clear')
      this.visible = false
    },

    // 多选时按 key 移除一个 tag
    removeTagByKey(key) {
      if (this.disabled) return
      const labelKey = this.normalizedProps.label
      const keys = this.selectedKeys.filter((k) => k !== key)
      if (keys.length === this.selectedKeys.length) return
      this.$emit('input', keys)
      const nodes = keys.map((k) => ({
        [this.valueKey]: k,
        [labelKey]: findLabelByKey(this.nodeMap, k, this.props),
      }))
      this.$emit('change', keys, nodes)
    },

    // 退格删除（多选 + 可搜索 + 输入框为空时）
    handleDelete() {
      if (!this.isMultiple || !this.filterable) return
      if (this.query) return
      if (this.selectedKeys.length === 0) return
      const keys = this.selectedKeys.slice(0, -1)
      this.$emit('input', keys)
      const labelKey = this.normalizedProps.label
      const nodes = keys.map((k) => ({
        [this.valueKey]: k,
        [labelKey]: findLabelByKey(this.nodeMap, k, this.props),
      }))
      this.$emit('change', keys, nodes)
    },

    handleFocus(e) {
      this.inputFocused = true
      this.$emit('focus', e)
      if (this.automaticDropdown && !this.visible) {
        this.visible = true
      }
    },

    handleBlur(e) {
      this.inputFocused = false
      this.$emit('blur', e)
    },

    handlePopoverShow() {
      this.updatePopoverWidth()
      this.syncTreeState()
    },

    handlePopoverHide() {
      if (this.filterable) this.query = ''
    },

    // 测量触发器宽度并应用到下拉
    updatePopoverWidth() {
      this.$nextTick(() => {
        const ref = this.$el.querySelector('.v2-tree-select__reference')
        if (ref) {
          this.popoverWidth = ref.offsetWidth
        }
      })
    },

    // ==================== 对外方法 ====================
    focus() {
      const input = this.$refs.input
      if (input) input.focus()
    },

    blur() {
      const input = this.$refs.input
      if (input) input.blur()
      this.visible = false
    },

    // el-tree 方法透传
    getTree() {
      return this.$refs.tree
    },

    getNode(data) {
      return this.$refs.tree && this.$refs.tree.getNode(data)
    },
    getCurrentKey() {
      return this.$refs.tree && this.$refs.tree.getCurrentKey()
    },
    getCurrentNode() {
      return this.$refs.tree && this.$refs.tree.getCurrentNode()
    },
    setCurrentKey(key) {
      this.$refs.tree && this.$refs.tree.setCurrentKey(key)
    },
    setCurrentNode(node) {
      this.$refs.tree && this.$refs.tree.setCurrentNode(node)
    },
    getCheckedKeys(leafOnly) {
      return this.$refs.tree ? this.$refs.tree.getCheckedKeys(leafOnly) : []
    },
    getCheckedNodes(leafOnly, includeHalfChecked) {
      return this.$refs.tree
        ? this.$refs.tree.getCheckedNodes(leafOnly, includeHalfChecked)
        : []
    },
    setCheckedKeys(keys, leafOnly) {
      this.$refs.tree && this.$refs.tree.setCheckedKeys(keys, leafOnly)
    },
    setCheckedNodes(nodes, leafOnly) {
      this.$refs.tree && this.$refs.tree.setCheckedNodes(nodes, leafOnly)
    },
    setChecked(data, checked, deep) {
      this.$refs.tree && this.$refs.tree.setChecked(data, checked, deep)
    },
    getHalfCheckedNodes() {
      return this.$refs.tree ? this.$refs.tree.getHalfCheckedNodes() : []
    },
    getHalfCheckedKeys() {
      return this.$refs.tree ? this.$refs.tree.getHalfCheckedKeys() : []
    },
    getNodePath(data) {
      return this.$refs.tree && this.$refs.tree.getNodePath(data)
    },
    updateKeyChildren(key, data) {
      this.$refs.tree && this.$refs.tree.updateKeyChildren(key, data)
    },
    filter(value) {
      if (this.$refs.tree) {
        this.$refs.tree.filter(value)
      }
    },
  },
}
</script>
