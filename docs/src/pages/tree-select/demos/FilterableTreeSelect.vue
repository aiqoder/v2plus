<template>
  <div style="width: 240px">
    <v2-tree-select
      v-model="value"
      :data="data"
      filterable
      :default-expand-all="true"
      placeholder="输入关键字搜索"
      style="width: 100%"
    />
    <p class="demo-result">当前值：{{ value }}</p>
  </div>
</template>

<script>
import { V2TreeSelect } from '@components/tree-select'
import { treeData } from './shared'

export default {
  components: { V2TreeSelect },
  data() {
    return {
      value: '',
      data: treeData,
    }
  },
}
</script>
