<template>
  <div>
    <el-button type="primary" @click="visible = true">打开弹窗（容器内）</el-button>
    <p class="demo-tip">弹窗挂载到下方虚线框容器内，遮罩仅覆盖容器区域。</p>

    <!-- 自定义容器 -->
    <div
      ref="container"
      class="dialog-container"
    >
      <p style="text-align: center; color: #909399; margin: 0;">弹窗挂载区域</p>
    </div>

    <v2-dialog
      :visible.sync="visible"
      title="容器内弹窗"
      :width="400"
      :height="300"
      append-to=".dialog-container"
      :append-to-body="false"
      :modal-append-to-body="false"
    >
      <p>此弹窗的遮罩和内容均限定在虚线框内。</p>
      <p>拖拽和缩放仍正常工作，边界以容器为限。</p>
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
.dialog-container {
  position: relative;
  margin-top: 16px;
  width: 100%;
  min-height: 300px;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}
.demo-tip {
  margin: 12px 0 0;
  font-size: 13px;
  color: #909399;
}
</style>
