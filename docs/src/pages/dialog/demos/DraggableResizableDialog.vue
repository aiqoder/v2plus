<template>
  <div>
    <el-button type="primary" @click="visible = true">打开弹窗</el-button>
    <p class="demo-tip">打开后可拖拽标题栏移动、拖拽边缘/四角缩放。</p>
    <v2-dialog
      :visible.sync="visible"
      title="可拖拽 &amp; 缩放"
      :width="520"
      :height="360"
      :min-width="320"
      :min-height="240"
      draggable
      resizable
    >
      <div style="padding: 8px 0;">
        <p><strong>拖拽：</strong>按住标题栏拖动，边界约束不超出视口。</p>
        <p><strong>缩放：</strong>拖拽 8 个方向的缩放手柄调整尺寸。</p>
        <p><strong>最小尺寸：</strong>min-width=320, min-height=240。</p>
      </div>
      <template #footer>
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="visible = false">确 定</el-button>
      </template>
    </v2-dialog>
  </div>
</template>

<script>
import { V2Dialog } from '@components/dialog'

export default {
  components: { V2Dialog },
  data() {
    return {
      visible: false,
    }
  },
}
</script>

<style scoped>
.demo-tip {
  margin: 12px 0 0;
  font-size: 13px;
  color: #909399;
}
</style>
