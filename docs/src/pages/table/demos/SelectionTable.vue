<template>
  <div>
    <v2-table ref="table" :data="tableData" border @selection-change="onChange" style="width: 100%">
      <v2-table-column type="selection" width="55" />
      <v2-table-column prop="date" label="日期" width="180" />
      <v2-table-column prop="name" label="姓名" width="180" />
      <v2-table-column prop="address" label="地址" />
    </v2-table>
    <div style="margin-top:16px;display:flex;align-items:center;gap:12px;">
      <button class="demo-btn" @click="clearSel">清空</button>
      <span v-if="sel.length" style="color:var(--el-text-color-regular);font-size:14px;">
        已选: {{ sel.map(r => r.name).join('、') }}
      </span>
    </div>
  </div>
</template>

<script>
import { V2Table, V2TableColumn } from '@components/table'
import { baseTableData } from './shared'

export default {
  components: { V2Table, V2TableColumn },
  data() {
    return {
      tableData: [...baseTableData],
      sel: [],
    }
  },
  methods: {
    onChange(rows) { this.sel = rows },
    clearSel() { this.$refs.table.clearSelection() },
  },
}
</script>
