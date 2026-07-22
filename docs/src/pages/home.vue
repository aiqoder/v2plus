<template>
  <div class="page">
    <h1>快速开始</h1>
    <p>V2Plus 是一个兼容 Element Plus API 的 Vue 2 组件库，提供与 Element Plus 完全一致的开发体验。</p>

    <h2>安装</h2>
    <p>推荐使用 npm 进行安装：</p>
    <pre><code>npm install v2plus</code></pre>

    <h2>全局注册</h2>
    <p>完整引入，所有组件全局可用：</p>
    <pre><code>import Vue from 'vue'
import V2Plus from 'v2plus'
import 'v2plus/dist/v2plus.css'

Vue.use(V2Plus)</code></pre>

    <h2>按需引入</h2>
    <p>只引入需要的组件，减小打包体积：</p>
    <pre><code>import { Table, TableColumn } from 'v2plus'
import 'v2plus/dist/v2plus.css'

export default {
  components: { Table, TableColumn }
}</code></pre>

    <h2>基础示例</h2>
    <p>一个简单的数据表格：</p>
    <code-preview :source="source">
      <template #demo>
        <v2-table :data="tableData" border stripe style="width: 100%">
          <v2-table-column type="index" label="#" width="60" />
          <v2-table-column prop="date" label="日期" width="180" sortable />
          <v2-table-column prop="name" label="姓名" width="180" />
          <v2-table-column prop="address" label="地址" show-overflow-tooltip />
        </v2-table>
      </template>
    </code-preview>
  </div>
</template>

<script>
import { V2Table, V2TableColumn } from '@components/table'
import CodePreview from '../components/CodePreview.vue'

export default {
  components: { V2Table, V2TableColumn, CodePreview },
  data() {
    return {
      tableData: [
        { date: '2016-05-03', name: '张三', address: '上海市普陀区金沙江路 1518 弄' },
        { date: '2016-05-02', name: '李四', address: '上海市普陀区金沙江路 1517 弄' },
        { date: '2016-05-04', name: '王五', address: '上海市普陀区金沙江路 1519 弄' },
        { date: '2016-05-01', name: '赵六', address: '上海市普陀区金沙江路 1516 弄' },
      ],
      source: `<template>
  <v2-table :data="tableData" border stripe style="width: 100%">
    <v2-table-column type="index" label="#" width="60" />
    <v2-table-column prop="date" label="日期" width="180" sortable />
    <v2-table-column prop="name" label="姓名" width="180" />
    <v2-table-column prop="address" label="地址" show-overflow-tooltip />
  </v2-table>
</template>`,
    }
  },
}
</script>
