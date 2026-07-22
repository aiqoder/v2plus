<template>
  <v2-table :data="tableData" border style="width: 100%">
    <v2-table-column type="expand" />
    <template #expand="{ row }">
      <div style="padding: 8px 16px">
        <p><strong>日期：</strong>{{ row.date }}</p>
        <p><strong>姓名：</strong>{{ row.name }}</p>
        <p><strong>地址：</strong>{{ row.address }}</p>
      </div>
    </template>
    <v2-table-column prop="date" label="日期" width="180" />
    <v2-table-column prop="name" label="姓名" width="180" />
    <v2-table-column prop="address" label="地址" />
  </v2-table>
</template>

<script>
import { V2Table, V2TableColumn } from '@components/table'
import { baseTableData } from './shared'

export default {
  components: { V2Table, V2TableColumn },
  data() {
    return { tableData: [...baseTableData].slice(0, 3) }
  },
}
</script>
