<template>
  <div id="playground">
    <h1>V2Plus Playground</h1>

    <h2>测试 1：基础表格</h2>
    <v2-table :data="tableData" border stripe style="width: 100%">
      <v2-table-column type="selection" width="55" />
      <v2-table-column type="index" label="#" width="60" />
      <v2-table-column prop="name" label="名称" sortable width="180" />
      <v2-table-column prop="date" label="日期" width="180" />
      <v2-table-column
        prop="address"
        label="地址（overflow tooltip）"
        width="200"
        show-overflow-tooltip
      />
      <v2-table-column label="操作" width="150">
        <template #default="{ row }">
          <button @click="handleEdit(row)">编辑</button>
          <button @click="handleDelete(row)">删除</button>
        </template>
      </v2-table-column>
    </v2-table>

    <h2>测试 2：固定列 + 横向滚动</h2>
    <v2-table :data="tableDataMany" border stripe style="width: 100%">
      <v2-table-column fixed type="selection" width="55" />
      <v2-table-column fixed type="index" label="#" width="60" />
      <v2-table-column fixed prop="name" label="名称" sortable width="180" />
      <v2-table-column prop="date" label="日期" width="180" />
      <v2-table-column prop="address" label="地址" width="300" />
      <v2-table-column prop="province" label="省份" width="150" />
      <v2-table-column prop="city" label="城市" width="150" />
      <v2-table-column prop="zip" label="邮编" width="120" />
      <v2-table-column fixed="right" label="操作" width="150">
        <template #default="{ row }">
          <button @click="handleEdit(row)">编辑</button>
          <button @click="handleDelete(row)">删除</button>
        </template>
      </v2-table-column>
    </v2-table>

    <h2>测试 3：固定表头 + 高度</h2>
    <v2-table :data="tableDataLarge" border stripe height="250" style="width: 100%">
      <v2-table-column prop="date" label="日期" width="180" />
      <v2-table-column prop="name" label="名称" sortable width="180" />
      <v2-table-column prop="address" label="地址" show-overflow-tooltip />
      <v2-table-column prop="province" label="省份" width="150" />
      <v2-table-column prop="city" label="城市" width="150" />
      <v2-table-column prop="zip" label="邮编" width="120" />
    </v2-table>
  </div>
</template>

<script>
import { V2Table, V2TableColumn } from '../packages/v2plus'
import '../packages/theme-chalk/src/index.scss'

export default {
  name: 'Playground',
  components: { V2Table, V2TableColumn },
  data() {
    return {
      tableData: [
        { date: '2016-05-03', name: '张三', address: '上海市普陀区金沙江路 1518 弄', province: '上海', city: '上海市', zip: '200333' },
        { date: '2016-05-02', name: '李四', address: '上海市普陀区金沙江路 1517 弄', province: '上海', city: '上海市', zip: '200333' },
        { date: '2016-05-04', name: '王五', address: '上海市普陀区金沙江路 1519 弄', province: '上海', city: '上海市', zip: '200333' },
        { date: '2016-05-01', name: '赵六', address: '上海市普陀区金沙江路 1516 弄', province: '上海', city: '上海市', zip: '200333' },
        { date: '2016-05-08', name: '孙七', address: '上海市普陀区金沙江路 1520 弄', province: '上海', city: '上海市', zip: '200333' },
      ],
      tableDataMany: [...Array(5)].map((_, i) => ({
        date: `2016-05-0${i + 1}`,
        name: ['张三', '李四', '王五', '赵六', '孙七'][i],
        address: `上海市普陀区金沙江路 ${1516 + i} 弄`,
        province: '上海',
        city: '上海市',
        zip: '200333',
      })),
      tableDataLarge: [...Array(20)].map((_, i) => ({
        date: `2016-05-${String(i + 1).padStart(2, '0')}`,
        name: ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'][i % 8],
        address: `上海市普陀区金沙江路 ${1500 + i} 弄`,
        province: '上海',
        city: '上海市',
        zip: '200333',
      })),
    }
  },
  methods: {
    handleEdit(row) {
      console.log('编辑:', row)
    },
    handleDelete(row) {
      console.log('删除:', row)
    },
  },
}
</script>
