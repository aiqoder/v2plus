/**
 * 表单状态管理器
 *
 * 管理表格的表单编辑状态、数据备份、校验调度。
 * 支持三种编辑模式：row（行切换）、batch（批量选择）、always（始终编辑）
 *
 * 核心行为：
 * - always 模式下 commitEdit 不退出编辑态
 * - cancelEdit 在 always 模式下只恢复数据不退出编辑态
 * - 排序/筛选触发自动 cancelEdit 放弃所有修改
 */

import Vue from 'vue'
import { validateField, validateRow, validateAll } from './validator'

export default class FormManager {
  /**
   * @param {Object} table - 表格组件实例
   * @param {Object} options - 配置
   * @param {string} options.editMode - 'row' | 'batch' | 'always'
   * @param {boolean} options.autoBackup - 是否自动备份（默认 true）
   * @param {string} options.validateTrigger - 'change' | 'blur'（默认 'change'）
   */
  constructor(table, options = {}) {
    this.table = table
    this.editMode = options.editMode || 'row'
    this.autoBackup = options.autoBackup !== false
    this.validateTrigger = options.validateTrigger || 'change'

    // 编辑状态: Map<rowKey, { editing, backup, errors }>
    this.state = Vue.observable({
      editMap: new Map(),
      // 收集到的校验规则: Map<prop, rules[]>
      columnRules: new Map(),
    })

    // 标记是否所有行始终编辑（always 模式）
    this.alwaysEdit = this.editMode === 'always'

    // 已修改的行标记（用于 getModifiedRows）
    this._modifiedKeys = new Set()
  }

  /**
   * 注册列的校验规则
   */
  registerRules(prop, rules) {
    if (prop && rules && rules.length > 0) {
      this.state.columnRules.set(prop, rules)
    }
  }

  /**
   * 获取行的 key
   */
  getRowKey(row) {
    return this.table.store.getRowKey(row)
  }

  /**
   * 进入编辑态
   * @param {Array|Object} rows - 行数据或行数组，不传则 = 所有选中行，无选中 = 所有行
   */
  startEdit(rows) {
    const targetRows = this._resolveRows(rows)

    targetRows.forEach((row) => {
      const key = this.getRowKey(row)
      const current = this.state.editMap.get(key)

      if (current && current.editing) return // 已在编辑中

      const backup = this.autoBackup ? { ...row } : null

      this.state.editMap.set(key, Vue.observable({
        editing: true,
        backup,
        errors: {},
      }))
    })

    // Vue 2 无法响应式追踪 Map 的增删，替换 editMap 引用以触发依赖编辑状态的视图更新
    this.state.editMap = new Map(this.state.editMap)
  }

  /**
   * 校验并提交编辑。不退出编辑态。
   * @param {Array|Object} rows - 行数据，不传 = 所有编辑中的行
   * @returns {Promise<{ valid: boolean, errors: Map }>}
   */
  async commitEdit(rows) {
    const targetRows = rows ? this._resolveRows(rows) : this.getEditingRows()
    let allValid = true
    const allErrors = new Map()

    for (const row of targetRows) {
      const key = this.getRowKey(row)
      const state = this.state.editMap.get(key)
      if (!state || !state.editing) continue

      // 校验该行
      const rulesObj = {}
      this.state.columnRules.forEach((rules, prop) => {
        rulesObj[prop] = rules
      })

      const result = await validateRow(row, rulesObj)
      if (!result.valid) {
        allValid = false
        allErrors.set(key, result.fieldErrors)
        // 更新编辑状态中的 errors
        const errorObj = {}
        result.fieldErrors.forEach((errs, prop) => {
          errorObj[prop] = errs
        })
        state.errors = errorObj
      } else {
        state.errors = {}
        this._modifiedKeys.add(key)
      }
    }

    return { valid: allValid, errors: allErrors }
  }

  /**
   * 取消编辑，恢复备份数据
   * @param {Array|Object} rows - 行数据，不传 = 所有编辑中的行
   * @param {boolean} forceExit - always 模式下是否强制退出编辑态
   */
  cancelEdit(rows, forceExit = false) {
    const targetRows = rows ? this._resolveRows(rows) : this.getEditingRows()

    targetRows.forEach((row) => {
      const key = this.getRowKey(row)
      const state = this.state.editMap.get(key)
      if (!state || !state.editing) return

      // 恢复备份数据
      if (state.backup) {
        Object.keys(state.backup).forEach((k) => {
          row[k] = state.backup[k]
        })
      }

      // always 模式下不退出编辑态
      if (this.alwaysEdit && !forceExit) {
        state.errors = {}
        if (this.autoBackup) {
          state.backup = { ...row }
        }
      } else {
        this.state.editMap.delete(key)
      }

      this._modifiedKeys.delete(key)
    })

    // 替换 editMap 引用，触发视图更新（同 startEdit）
    this.state.editMap = new Map(this.state.editMap)
  }

  /**
   * 强制所有行退出编辑态（排序/筛选时调用）
   */
  exitAll() {
    this.state.editMap = new Map()
    this._modifiedKeys.clear()
  }

  /**
   * 校验单个字段
   * @returns {Promise<{ valid: boolean, errors: string[] }>}
   */
  async validateField(row, prop) {
    const rules = this.state.columnRules.get(prop)
    if (!rules) return { valid: true, errors: [] }

    const value = row[prop]
    const result = await validateField(value, rules, row)

    // 更新编辑状态中的 field errors
    const key = this.getRowKey(row)
    const state = this.state.editMap.get(key)
    if (state) {
      if (result.valid) {
        Vue.delete(state.errors, prop)
      } else {
        Vue.set(state.errors, prop, result.errors)
      }
    }

    return result
  }

  /**
   * 校验整行
   */
  async validateRow(row) {
    const rulesObj = {}
    this.state.columnRules.forEach((rules, prop) => {
      rulesObj[prop] = rules
    })
    return validateRow(row, rulesObj)
  }

  /**
   * 校验所有行
   */
  async validateAll() {
    const allRows = this.table.store.getSortedData()
    const rulesObj = {}
    this.state.columnRules.forEach((rules, prop) => {
      rulesObj[prop] = rules
    })
    return validateAll(allRows, rulesObj, (r) => this.getRowKey(r))
  }

  /**
   * 清除校验错误
   */
  clearValidate(rows) {
    const targetRows = rows ? this._resolveRows(rows) : this.getEditingRows()
    targetRows.forEach((row) => {
      const key = this.getRowKey(row)
      const state = this.state.editMap.get(key)
      if (state) {
        state.errors = {}
      }
    })
  }

  /**
   * 获取有修改的行
   * @returns {Array<{ row: Object, changes: Object }>}
   */
  getModifiedRows() {
    const data = this.table.store.getSortedData()
    const result = []

    data.forEach((row) => {
      const key = this.getRowKey(row)
      const state = this.state.editMap.get(key)

      if (this._modifiedKeys.has(key) || (state && state.editing)) {
        const changes = {}
        if (state && state.backup) {
          Object.keys(state.backup).forEach((k) => {
            if (row[k] !== state.backup[k]) {
              changes[k] = row[k]
            }
          })
        }
        result.push({ row, changes })
      }
    })

    return result
  }

  /**
   * 获取所有编辑中的行
   */
  getEditingRows() {
    const data = this.table.store.getSortedData()
    return data.filter((row) => {
      const key = this.getRowKey(row)
      const state = this.state.editMap.get(key)
      return state && state.editing
    })
  }

  /**
   * 行是否处于编辑态
   */
  isEditing(row) {
    const key = this.getRowKey(row)
    const state = this.state.editMap.get(key)
    return !!(state && state.editing)
  }

  /**
   * 获取行的校验错误
   */
  getRowErrors(row) {
    const key = this.getRowKey(row)
    const state = this.state.editMap.get(key)
    return state ? state.errors || {} : {}
  }

  /**
   * 获取列的校验错误文本（用于单元格显示）
   */
  getCellError(row, prop) {
    const errors = this.getRowErrors(row)
    const fieldErrs = errors[prop]
    return fieldErrs && fieldErrs.length > 0 ? fieldErrs[0] : ''
  }

  /**
   * 获取所有处于编辑态的行的 key 集合
   */
  get editingKeys() {
    const keys = []
    this.state.editMap.forEach((state, key) => {
      if (state.editing) keys.push(key)
    })
    return keys
  }

  /**
   * 解析 rows 参数
   */
  _resolveRows(rows) {
    if (rows) {
      return Array.isArray(rows) ? rows : [rows]
    }

    // 未指定 → 选中行 → 全部行
    const selection = this.table.store.state.selection
    if (selection && selection.length > 0) {
      return selection
    }

    return this.table.store.getSortedData()
  }

  /**
   * 销毁
   */
  destroy() {
    this.state.editMap.clear()
    this.state.columnRules.clear()
    this._modifiedKeys.clear()
  }
}
