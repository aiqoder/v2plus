<template>
  <div>
    <p class="demo-desc">
      虚拟滚动：10000 条数据，动态行高（每隔 100 行高度变化）。
      当前可见范围：{{ visibleInfo }}
    </p>
    <v2-table
      ref="table"
      :data="tableData"
      :virtual-scroll="true"
      :estimated-row-height="48"
      :overscan-count="5"
      height="400"
      border
      stripe
      :row-style="rowStyleFn"
      style="width: 100%"
    >
      <v2-table-column type="index" label="#" width="60" />
      <v2-table-column prop="id" label="ID" width="80" sortable />
      <v2-table-column prop="name" label="姓名" width="120" />
      <v2-table-column prop="city" label="城市" width="120" />
      <v2-table-column prop="email" label="邮箱" />
      <v2-table-column prop="desc" label="描述" min-width="200" show-overflow-tooltip />
    </v2-table>
  </div>
</template>

<script>
import { V2Table, V2TableColumn } from '@components/table'

const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京']
const names = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十']

function generateData(count) {
  const data = []
  for (let i = 0; i < count; i++) {
    data.push({
      id: i + 1,
      name: names[i % names.length],
      city: cities[i % cities.length],
      email: `user${i + 1}@example.com`,
      desc: `这是第 ${i + 1} 条数据${i % 50 === 0 ? '的描述信息，内容较长用来展示溢出省略效果' : ''}`,
      _tall: i % 100 === 0, // 每隔 100 行为高行
    })
  }
  return data
}

export default {
  components: { V2Table, V2TableColumn },
  data() {
    return {
      tableData: generateData(10000),
      visibleInfo: '',
    }
  },
  mounted() {
    this.$nextTick(() => {
      const table = this.$refs.table
      if (table && table.virtualScrollManager) {
        const range = table.virtualScrollManager.getVisibleRange()
        this.visibleInfo = `${range.start}-${range.end}`
      }
    })
  },
  methods: {
    rowStyleFn({ row, rowIndex }) {
      // 每隔 100 行使用较大行高模拟动态行高
      if (row._tall) {
        return { height: '80px' }
      }
      return {}
    },
  },
}
</script>
