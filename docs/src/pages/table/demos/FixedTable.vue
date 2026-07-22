<template>
  <v2-table :data="tableData" border style="width: 100%">
    <v2-table-column fixed="left" prop="date" label="日期" width="150" />
    <v2-table-column prop="name" label="姓名" width="120" />
    <v2-table-column prop="province" label="省份" width="120" />
    <v2-table-column prop="city" label="城市" width="120" />
    <v2-table-column prop="district" label="区县" width="120" />
    <v2-table-column prop="zip" label="邮编" width="120" />
    <v2-table-column fixed="right" label="操作" width="120">
      <template #default>
        <a href="javascript:;" style="color:#409eff;margin-right:8px;">编辑</a>
        <a href="javascript:;" style="color:#f56c6c;">删除</a>
      </template>
    </v2-table-column>
  </v2-table>
</template>

<script>
import { V2Table, V2TableColumn } from '@components/table'

export default {
  components: { V2Table, V2TableColumn },
  data() {
    return {
      tableData: [
        { date: '2016-05-03', name: '张三', province: '上海', city: '上海', district: '普陀区', zip: '200333' },
        { date: '2016-05-02', name: '李四', province: '北京', city: '北京', district: '朝阳区', zip: '100020' },
        { date: '2016-05-04', name: '王五', province: '广东', city: '深圳', district: '南山区', zip: '518000' },
        { date: '2016-05-01', name: '赵六', province: '浙江', city: '杭州', district: '西湖区', zip: '310000' },
      ],
    }
  },
}
</script>
