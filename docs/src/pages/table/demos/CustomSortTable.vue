<template>
  <v2-table :data="tableData" border style="width: 100%">
    <v2-table-column prop="date" label="日期" width="180" sortable />
    <v2-table-column prop="name" label="姓名" width="180" :sort-method="sortByName" sortable />
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
        { date: '2016-05-03', name: 'Bob', address: 'New York' },
        { date: '2016-05-02', name: 'Alice', address: 'London' },
        { date: '2016-05-04', name: 'Charlie', address: 'Tokyo' },
        { date: '2016-05-01', name: 'David', address: 'Paris' },
      ],
    }
  },
  methods: {
    sortByName(a, b) { return a.localeCompare(b) },
  },
}
</script>
