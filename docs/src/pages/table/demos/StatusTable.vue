<template>
  <v2-table :data="tableData" border :row-class-name="rowClassName" style="width: 100%">
    <v2-table-column prop="date" label="日期" width="180" />
    <v2-table-column prop="name" label="姓名" width="180" />
    <v2-table-column prop="address" label="地址" />
  </v2-table>
</template>

<script>
import { V2Table, V2TableColumn } from '@components/table'

export default {
  components: { V2Table, V2TableColumn },
  data() {
    return {
      tableData: [
        { date: '2016-05-03', name: '张三', address: '上海市普陀区金沙江路 1518 弄' },
        { date: '2016-05-02', name: '李四', address: '上海市普陀区金沙江路 1517 弄' },
        { date: '2016-05-04', name: '王五', address: '上海市普陀区金沙江路 1519 弄' },
      ],
    }
  },
  methods: {
    rowClassName({ rowIndex }) {
      if (rowIndex === 1) return 'warning-row'
      if (rowIndex === 2) return 'success-row'
      return ''
    },
  },
}
</script>
