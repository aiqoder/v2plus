<template>
  <v2-table :data="tableData" show-filter-row border style="width: 100%">
    <v2-table-column type="index" label="#" width="60" />
    <v2-table-column prop="date" label="日期" width="180">
      <template #filter-cell="{ column }">
        <el-input v-model="filters.date" placeholder="筛选日期..." clearable size="small" />
      </template>
    </v2-table-column>
    <v2-table-column prop="name" label="姓名" width="180">
      <template #filter-cell="{ column }">
        <el-select v-model="filters.name" placeholder="全部" clearable size="small" style="width:100%">
          <el-option label="全部" value="" />
          <el-option v-for="n in nameList" :key="n" :label="n" :value="n" />
        </el-select>
      </template>
    </v2-table-column>
    <v2-table-column prop="address" label="地址">
      <template #filter-cell="{ column }">
        <el-input v-model="filters.address" placeholder="筛选地址..." clearable size="small" />
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
    return {
      rawData: [...baseTableData],
      filters: { date: '', name: '', address: '' },
    }
  },
  computed: {
    tableData() {
      return this.rawData.filter(row => {
        return (!this.filters.date || row.date.includes(this.filters.date))
          && (!this.filters.name || row.name === this.filters.name)
          && (!this.filters.address || row.address.includes(this.filters.address))
      })
    },
    nameList() {
      return [...new Set(this.rawData.map(r => r.name))]
    },
  },
}
</script>
