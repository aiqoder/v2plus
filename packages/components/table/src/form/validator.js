/**
 * 表单校验引擎
 * 兼容 async-validator 规则格式
 * 未引入外部依赖，使用内置精简实现
 */

/**
 * 内置校验规则
 */
const builtinRules = {
  required(val, param, message) {
    if (param === false) return true
    if (val === undefined || val === null || val === '') {
      return message || '该字段为必填项'
    }
    if (Array.isArray(val) && val.length === 0) {
      return message || '该字段为必填项'
    }
    return true
  },

  type(val, param, message) {
    const typeCheck = {
      string: (v) => typeof v === 'string',
      number: (v) => typeof v === 'number' && !isNaN(v),
      boolean: (v) => typeof v === 'boolean',
      array: (v) => Array.isArray(v),
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)),
      url: (v) => /^https?:\/\/.+/.test(String(v)),
      date: (v) => !isNaN(Date.parse(String(v))),
    }
    const fn = typeCheck[param]
    if (!fn) return true
    return fn(val) ? true : message || `类型必须为 ${param}`
  },

  min(val, param, message) {
    if (val === undefined || val === null || val === '') return true
    if (typeof val === 'number') {
      return val >= param ? true : message || `最小值为 ${param}`
    }
    if (typeof val === 'string' || Array.isArray(val)) {
      return val.length >= param ? true : message || `最少 ${param} 个字符`
    }
    return true
  },

  max(val, param, message) {
    if (val === undefined || val === null || val === '') return true
    if (typeof val === 'number') {
      return val <= param ? true : message || `最大值为 ${param}`
    }
    if (typeof val === 'string' || Array.isArray(val)) {
      return val.length <= param ? true : message || `最多 ${param} 个字符`
    }
    return true
  },

  len(val, param, message) {
    if (val === undefined || val === null || val === '') return true
    if (typeof val === 'string' || Array.isArray(val)) {
      return val.length === param ? true : message || `长度必须为 ${param}`
    }
    return true
  },

  pattern(val, param, message) {
    if (val === undefined || val === null || val === '') return true
    const re = typeof param === 'string' ? new RegExp(param) : param
    return re.test(String(val)) ? true : message || '格式不正确'
  },

  validator(val, param, message, row, callback) {
    // 自定义校验函数: (rule, value, callback) => callback(error?)
    if (typeof param === 'function') {
      return new Promise((resolve) => {
        param({ field: '' }, val, (error) => {
          if (error) {
            resolve(typeof error === 'string' ? error : error.message || message || '校验失败')
          } else {
            resolve(true)
          }
        })
      })
    }
    return true
  },
}

/**
 * 校验单个字段
 * @param {*} value - 字段值
 * @param {Array} rules - 校验规则数组 [{ required: true, min: 2, message: '...' }]
 * @param {Object} row - 当前行数据（用于 validator 自定义校验）
 * @returns {Promise<{ valid: boolean, errors: string[] }>}
 */
export async function validateField(value, rules, row) {
  if (!rules || rules.length === 0) {
    return { valid: true, errors: [] }
  }

  const errors = []

  for (const rule of rules) {
    if (!rule) continue

    // 提取所有校验规则
    const entries = Object.entries(rule).filter(([key]) => key !== 'message' && key !== 'trigger')

    for (const [ruleName, param] of entries) {
      if (ruleName === 'validator') {
        // 自定义校验
        const result = await builtinRules.validator(value, param, rule.message, row)
        if (result !== true) {
          errors.push(result)
        }
      } else if (builtinRules[ruleName]) {
        const result = builtinRules[ruleName](value, param, rule.message)
        if (result !== true) {
          errors.push(result)
        }
      }
      // 未知规则静默跳过
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 校验整行数据
 * @param {Object} row - 行数据
 * @param {Object} columnRules - { prop: rules[] } 映射
 * @returns {Promise<{ valid: boolean, fieldErrors: Map<string, string[]> }>}
 */
export async function validateRow(row, columnRules) {
  const fieldErrors = new Map()
  let valid = true

  for (const [prop, rules] of Object.entries(columnRules)) {
    if (!rules || rules.length === 0) continue
    const value = row[prop]
    const result = await validateField(value, rules, row)
    if (!result.valid) {
      fieldErrors.set(prop, result.errors)
      valid = false
    }
  }

  return { valid, fieldErrors }
}

/**
 * 校验所有行
 * @param {Array} rows - 行数据数组
 * @param {Object} columnRules - { prop: rules[] } 映射
 * @returns {Promise<{ valid: boolean, rowErrors: Map<*, Map<string, string[]>> }>}
 */
export async function validateAll(rows, columnRules, getRowKey) {
  const rowErrors = new Map()
  let valid = true

  for (const row of rows) {
    const result = await validateRow(row, columnRules)
    if (!result.valid) {
      rowErrors.set(getRowKey(row), result.fieldErrors)
      valid = false
    }
  }

  return { valid, rowErrors }
}
