<template>
  <div class="demo-row">
    <div style="width: 200px">
      <p class="demo-label">可清空 + 禁用节点</p>
      <v2-tree-select
        v-model="v1"
        :data="data"
        clearable
        :default-expand-all="true"
        placeholder="请选择"
        style="width: 100%"
      />
    </div>
    <div style="width: 200px">
      <p class="demo-label">禁用状态</p>
      <v2-tree-select
        v-model="v2"
        :data="data"
        disabled
        style="width: 100%"
      />
    </div>
    <div style="width: 160px">
      <p class="demo-label">size="small"</p>
      <v2-tree-select
        v-model="v3"
        :data="data"
        size="small"
        style="width: 100%"
      />
    </div>
  </div>
</template>

<script>
import { V2TreeSelect } from '@components/tree-select'
import { disabledTreeData } from './shared'

export default {
  components: { V2TreeSelect },
  data() {
    return {
      data: disabledTreeData,
      v1: '2-1',
      v2: '2-1',
      v3: '2-2',
    }
  },
}
</script>
