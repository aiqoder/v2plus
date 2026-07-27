<template>
  <div>
    <el-button type="primary" @click="visible = true">打开弹窗</el-button>
    <v2-dialog
      :visible.sync="visible"
      title="基础弹窗"
      width="480px"
    >
      <p>这是一个基础弹窗示例。</p>
      <p>支持拖拽标题栏移动、八向缩放手柄、双击全屏。</p>
      <p>关闭方式：点击遮罩（可配置）、按 ESC、点击关闭按钮。</p>
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
