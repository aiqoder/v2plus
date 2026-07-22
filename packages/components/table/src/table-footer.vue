<template>
  <table
    v-if="showSummary"
    class="v2-table__footer"
    cellspacing="0"
    cellpadding="0"
    border="0"
    :style="tableStyle"
  >
    <colgroup>
      <col v-for="col in columns" :key="col.id" :style="{ width: col.realWidth + 'px' }" />
    </colgroup>
    <tfoot>
      <tr>
        <!-- 第一个非隐藏列显示 sum-text -->
        <td
          v-for="(col, index) in columns"
          :key="col.id"
          class="v2-table__footer-cell"
          :class="footerCellClasses(col)"
        >
          <template v-if="index === 0 && sumText">
            <strong>{{ sumText }}</strong>
          </template>
          <template v-else>
            {{ getCellSummary(index) }}
          </template>
        </td>
      </tr>
    </tfoot>
  </table>
</template>

<script>
import { getPropByPath } from '../../../utils/objects'

export default {
  name: 'V2TableFooter',

  props: {
    columns: { type: Array, default: () => [] },
    data: { type: Array, default: () => [] },
    tableWidth: { type: Number, default: 0 },
    showSummary: { type: Boolean, default: false },
    sumText: { type: String, default: '合计' },
    summaryMethod: { type: Function },
  },

  computed: {
    tableStyle() {
      return this.tableWidth ? { width: this.tableWidth + 'px' } : {}
    },
  },

  methods: {
    footerCellClasses(col) {
      const align = col.align || 'left'
      return [`is-align-${align}`]
    },

    getCellSummary(index) {
      if (this.summaryMethod) {
        const summaries = this.summaryMethod({
          columns: this.columns,
          data: this.data,
        })
        return summaries[index] || ''
      }
      return this.defaultSummary(index)
    },

    defaultSummary(index) {
      if (index === 0) return ''
      const col = this.columns[index]
      if (!col || col.type === 'selection' || col.type === 'index' || col.type === 'expand') return ''
      const prop = col.property || col.prop
      if (!prop) return ''

      let sum = 0
      this.data.forEach((row) => {
        const result = getPropByPath(row, prop)
        const val = parseFloat(result.v)
        if (!isNaN(val)) sum += val
      })
      return sum || ''
    },
  },
}
</script>
