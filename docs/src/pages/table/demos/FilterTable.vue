<template>
  <v2-table :data="tableData" border style="width: 100%">
    <v2-table-column prop="date" label="日期" width="180" />
    <v2-table-column
      prop="name" label="姓名" width="180"
      column-key="name"
      :filters="nameFilters"
    />
    <v2-table-column prop="address" label="地址" />
  </v2-table>
</template>

<script>
import { V2Table, V2TableColumn } from '@components/table'
import { baseTableData } from './shared'

export default {
  components: { V2Table, V2TableColumn },
  data() {
    return {
      tableData: [...baseTableData],
      nameFilters: [
        { text: '张三', value: '张三' },
        { text: '李四', value: '李四' },
        { text: '王五', value: '王五' },
        { text: '赵六', value: '赵六' },
      ],
    }
  },
}
</script>
