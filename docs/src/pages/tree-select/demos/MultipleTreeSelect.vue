<template>
  <div style="width: 320px">
    <v2-tree-select
      v-model="value"
      :data="data"
      multiple
      show-checkbox
      collapse-tags
      :default-expand-all="true"
      placeholder="请选择（可多选）"
      style="width: 100%"
    />
    <p class="demo-result">当前值：{{ JSON.stringify(value) }}</p>
  </div>
</template>

<script>
import { V2TreeSelect } from '@components/tree-select'
import { treeData } from './shared'

export default {
  components: { V2TreeSelect },
  data() {
    return {
      value: ['2-1', '3-1'],
      data: treeData,
    }
  },
}
</script>
