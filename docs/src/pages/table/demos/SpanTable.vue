<template>
  <v2-table :data="tableData" border :span-method="spanMethod" style="width: 100%">
    <v2-table-column prop="id" label="ID" width="60" />
    <v2-table-column prop="name" label="姓名" width="100" />
    <v2-table-column prop="category" label="分类" width="100" />
    <v2-table-column prop="city" label="城市" width="100" />
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
        { id: '1', name: '张三', category: 'A 类', city: '北京', amount1: 234, amount2: 3.2, amount3: 10 },
        { id: '2', name: '李四', category: 'A 类', city: '上海', amount1: 165, amount2: 4.43, amount3: 12 },
        { id: '3', name: '王五', category: 'A 类', city: '广州', amount1: 324, amount2: 1.9, amount3: 9 },
        { id: '4', name: '赵六', category: 'B 类', city: '北京', amount1: 621, amount2: 2.2, amount3: 17 },
        { id: '5', name: '孙七', category: 'B 类', city: '上海', amount1: 539, amount2: 4.1, amount3: 15 },
        { id: '6', name: '周八', category: 'B 类', city: '广州', amount1: 432, amount2: 3.5, amount3: 11 },
      ],
    }
  },
  methods: {
    /**
     * span-method 示例
     * 返回 { rowspan, colspan } 控制单元格合并：
     *   - rowspan > 1  向下合并多行
     *   - colspan > 1  向右合并多列
     *   - 0/0           被合并掉，不渲染
     *   1/1             正常渲染（可省略）
     */
    spanMethod({ rowIndex, columnIndex }) {
      // ID 列：按分类合并行（A 类前3行合并，B 类后3行合并）
      if (columnIndex === 0) {
        if (rowIndex === 0) return { rowspan: 3, colspan: 1 }
        if (rowIndex === 3) return { rowspan: 3, colspan: 1 }
        return { rowspan: 0, colspan: 0 }
      }

      // 分类列：按分类合并行
      if (columnIndex === 2) {
        if (rowIndex === 0) return { rowspan: 3, colspan: 1 }
        if (rowIndex === 3) return { rowspan: 3, colspan: 1 }
        return { rowspan: 0, colspan: 0 }
      }

      // 数值 2 + 数值 3 合并为"小计"（横向合并）
      if (columnIndex === 5) return { rowspan: 1, colspan: 2 }
      if (columnIndex === 6) return { rowspan: 0, colspan: 0 }

      return { rowspan: 1, colspan: 1 }
    },
  },
}
</script>
