<template>
  <v2-table :data="tableData" border style="width: 100%">
    <v2-table-column prop="date" label="日期" width="180" />
    <v2-table-column prop="name" label="姓名" width="180">
      <template #header="{ column }">
        <span style="color:#409eff;">⭐ {{ column.label }}</span>
      </template>
    </v2-table-column>
    <v2-table-column prop="address" label="地址">
      <template #default="{ row }">
        <el-tag size="small">{{ row.address }}</el-tag>
      </template>
    </v2-table-column>
    <v2-table-column label="操作" width="160">
      <template #default>
        <a href="javascript:;" style="color:#409eff;margin-right:8px;">编辑</a>
        <a href="javascript:;" style="color:#f56c6c;">删除</a>
      </template>
    </v2-table-column>
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
