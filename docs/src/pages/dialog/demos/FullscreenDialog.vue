<template>
  <div>
    <el-button type="primary" @click="visible = true">打开弹窗</el-button>
    <p class="demo-tip">点击标题栏右侧的全屏按钮，或双击任意缩放手柄。</p>
    <v2-dialog
      :visible.sync="visible"
      title="全屏弹窗"
      :width="600"
      :height="400"
      fullscreen
      dblclick-fullscreen
    >
      <div style="padding: 8px 0;">
        <p><strong>方式一：</strong>点击关闭按钮左侧的全屏按钮 → 切换全屏 / 还原。</p>
        <p><strong>方式二：</strong>双击任一边缘或四角缩放手柄 → 沿方向铺满容器。</p>
        <p style="margin-top: 16px; color: #909399;">当前内容高度由 body 自动计算。</p>
      </div>
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
