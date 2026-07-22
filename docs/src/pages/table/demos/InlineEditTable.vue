<template>
  <div>
    <div style="margin-bottom: 12px;">
      <button class="demo-btn" @click="addRow">新增一行</button>
      <button class="demo-btn" style="margin-left: 8px;" @click="saveAll">保存全部</button>
    </div>
    <v2-table :data="tableData" border stripe style="width: 100%">
      <v2-table-column type="index" label="#" width="60" />
      <v2-table-column label="日期" width="180">
        <template #default="{ row }">
          <template v-if="row.__editing">
            <input
              v-model="row.date"
              class="edit-input"
              type="text"
            />
          </template>
          <template v-else>{{ row.date }}</template>
        </template>
      </v2-table-column>
      <v2-table-column label="姓名" width="160">
        <template #default="{ row }">
          <template v-if="row.__editing">
            <input
              v-model="row.name"
              class="edit-input"
              type="text"
            />
          </template>
          <template v-else>{{ row.name }}</template>
        </template>
      </v2-table-column>
      <v2-table-column label="地址">
        <template #default="{ row }">
          <template v-if="row.__editing">
            <input
              v-model="row.address"
              class="edit-input"
              type="text"
            />
          </template>
          <template v-else>{{ row.address }}</template>
        </template>
      </v2-table-column>
      <v2-table-column label="操作" width="200" align="center">
        <template #default="{ row, $index }">
          <template v-if="row.__editing">
            <a
              href="javascript:;"
              class="action-link"
              @click="saveRow(row, $index)"
            >保存</a>
            <a
              href="javascript:;"
              class="action-link action-link--cancel"
              @click="cancelEdit(row, $index)"
            >取消</a>
          </template>
          <template v-else>
            <a
              href="javascript:;"
              class="action-link"
              @click="editRow(row)"
            >编辑</a>
            <a
              href="javascript:;"
              class="action-link action-link--danger"
              @click="deleteRow($index)"
            >删除</a>
          </template>
        </template>
      </v2-table-column>
    </v2-table>
  </div>
</template>

<script>
import { V2Table, V2TableColumn } from '@components/table'
import { baseTableData } from './shared'

export default {
  components: { V2Table, V2TableColumn },
  data() {
    const data = baseTableData.map((item, i) => ({
      ...item,
      id: i + 1,
      __editing: false,
      __backup: null,
    }))
    return { tableData: data }
  },
  methods: {
    editRow(row) {
      row.__backup = { date: row.date, name: row.name, address: row.address }
      row.__editing = true
    },
    saveRow(row) {
      row.__editing = false
      row.__backup = null
    },
    cancelEdit(row, index) {
      if (row.__backup) {
        row.date = row.__backup.date
        row.name = row.__backup.name
        row.address = row.__backup.address
      } else {
        // 新增行取消 = 删除
        this.tableData.splice(index, 1)
      }
      row.__editing = false
      row.__backup = null
    },
    deleteRow(index) {
      this.tableData.splice(index, 1)
    },
    addRow() {
      const maxId = this.tableData.reduce((m, r) => Math.max(m, r.id || 0), 0)
      this.tableData.push({
        id: maxId + 1,
        date: '',
        name: '',
        address: '',
        __editing: true,
        __backup: null,
      })
    },
    saveAll() {
      this.tableData.forEach((row) => {
        row.__editing = false
        row.__backup = null
      })
    },
  },
}
</script>

<style scoped>
.edit-input {
  width: 100%;
  height: 28px;
  padding: 0 8px;
  font-size: 14px;
  line-height: 28px;
  border: 1px solid var(--brand-color, #409eff);
  border-radius: 4px;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s;
}
.edit-input:focus {
  border-color: var(--brand-color, #409eff);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
.action-link {
  color: var(--brand-color, #409eff);
  text-decoration: none;
  margin: 0 6px;
  font-size: 14px;
}
.action-link:hover {
  opacity: 0.8;
}
.action-link--cancel {
  color: #909399;
}
.action-link--danger {
  color: #f56c6c;
}
</style>
