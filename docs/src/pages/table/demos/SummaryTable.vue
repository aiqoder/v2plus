<template>
  <v2-table :data="tableData" border show-summary :summary-method="getSummaries" style="width: 100%">
    <v2-table-column prop="id" label="ID" width="180" />
    <v2-table-column prop="name" label="名称" />
    <v2-table-column prop="amount1" label="数值 1" width="120" />
    <v2-table-column prop="amount2" label="数值 2" width="120" />
    <v2-table-column prop="amount3" label="数值 3" width="120" />
  </v2-table>
</template>

<script>
import { V2Table, V2TableColumn } from '@components/table'

export default {
  components: { V2Table, V2TableColumn },
  data() {
    return {
      tableData: [
        { id: '12987122', name: '商品 A', amount1: 234, amount2: 3.2, amount3: 10 },
        { id: '12987123', name: '商品 B', amount1: 165, amount2: 4.43, amount3: 12 },
        { id: '12987124', name: '商品 C', amount1: 324, amount2: 1.9, amount3: 9 },
        { id: '12987125', name: '商品 D', amount1: 621, amount2: 2.2, amount3: 17 },
        { id: '12987126', name: '商品 E', amount1: 539, amount2: 4.1, amount3: 15 },
      ],
    }
  },
  methods: {
    getSummaries({ columns, data }) {
      const sums = []
      columns.forEach((col, i) => {
        if (i === 0) { sums[i] = '合计'; return }
        const vals = data.map(item => Number(item[col.property]))
        sums[i] = vals.reduce((p, c) => p + (isNaN(c) ? 0 : c), 0) + ' 元'
      })
      return sums
    },
  },
}
</script>
