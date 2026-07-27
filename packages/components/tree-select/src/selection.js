/**
 * TreeSelect 选中态逻辑工具
 * 负责 value ↔ node 的双向映射、label 回填、折叠 tag 计算等纯逻辑
 * 与视图层解耦，便于测试与复用
 */

// 默认字段映射 — 与 element-plus tree-select 保持一致
export const DEFAULT_TREE_PROPS = {
  label: 'label',
  children: 'children',
  disabled: 'disabled',
  class: 'class',
}

// 默认节点主键 — element-plus tree-select 默认使用 value 字段
export const DEFAULT_NODE_KEY = 'value'

/**
 * 规范化 props 字段映射，合并默认值
 * @param {Object} [props] 用户传入的 props 映射
 * @returns {Object} 完整的字段映射对象
 */
export function normalizeProps(props) {
  return Object.assign({}, DEFAULT_TREE_PROPS, props || {})
}

/**
 * 构建 key -> node 的扁平索引表
 * 用于 O(1) 反查 label，避免每次遍历整棵树
 * @param {Array} data 树数据
 * @param {String} nodeKey 主键字段名
 * @param {Object} [treeProps] 字段映射
 * @returns {Map} key -> node 的映射表
 */
export function buildNodeMap(data, nodeKey, treeProps) {
  const map = new Map()
  if (!Array.isArray(data) || !nodeKey) return map

  const childrenKey = normalizeProps(treeProps).children

  const walk = (nodes) => {
    if (!Array.isArray(nodes)) return
    nodes.forEach((node) => {
      const key = node[nodeKey]
      if (key !== undefined && key !== null) {
        map.set(key, node)
      }
      walk(node[childrenKey])
    })
  }
  walk(data)
  return map
}

/**
 * 根据 key 查询节点 label
 * @param {Map} map 节点索引表
 * @param {*} key 节点主键值
 * @param {Object} [treeProps] 字段映射
 * @returns {String} label 文本，未找到返回空串
 */
export function findLabelByKey(map, key, treeProps) {
  if (key === undefined || key === null || !map) return ''
  const node = map.get(key)
  if (!node) return ''
  return node[normalizeProps(treeProps).label]
}

/**
 * 将 v-model 的值统一解析为主键数组
 * 兼容基本类型值与对象值（配合 valueKey）
 * @param {*} value v-model 值（单值或数组）
 * @param {String} [valueKey] 对象值时取值字段
 * @returns {Array} 主键数组
 */
export function resolveValueToKeys(value, valueKey) {
  if (value === undefined || value === null || value === '') return []
  const list = Array.isArray(value) ? value : [value]
  return list
    .map((item) => {
      if (valueKey && item !== null && typeof item === 'object') {
        return item[valueKey]
      }
      return item
    })
    .filter((key) => key !== undefined && key !== null)
}

/**
 * 计算多选 tag 的折叠展示结果
 * @param {Array} labels 全部已选 label 列表
 * @param {Boolean} collapse 是否折叠
 * @param {Number} [maxCollapse=1] 折叠时最多展示的 tag 数量
 * @returns {{ visible: Array, rest: Number }}
 */
export function computeCollapseTags(labels, collapse, maxCollapse = 1) {
  if (!Array.isArray(labels)) return { visible: [], rest: 0 }
  if (!collapse || labels.length <= maxCollapse) {
    return { visible: labels.slice(), rest: 0 }
  }
  return {
    visible: labels.slice(0, maxCollapse),
    rest: labels.length - maxCollapse,
  }
}
