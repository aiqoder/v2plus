<template>
  <div style="width: 240px">
    <v2-tree-select
      v-model="value"
      :data="data"
      node-key="id"
      :props="fieldProps"
      :default-expand-all="true"
      placeholder="请选择部门"
      style="width: 100%"
    >
      <template #default="{ data: node }">
        <span class="custom-node">
          <i class="el-icon-office-building" />
          {{ node.name }}
        </span>
      </template>
    </v2-tree-select>
    <p class="demo-result">当前值：{{ value }}</p>
  </div>
</template>

<script>
import { V2TreeSelect } from '@components/tree-select'
import { customFieldTreeData } from './shared'

export default {
  components: { V2TreeSelect },
  data() {
    return {
      value: 11,
      data: customFieldTreeData,
      fieldProps: { label: 'name', children: 'children' },
    }
  },
}
</script>
