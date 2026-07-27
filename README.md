# V2Plus

兼容 Element Plus API 的 Vue 2 组件库。

## 在线文档

https://aiqoder.github.io/v2plus/

## 安装

```bash
npm install v2plus
```

## 使用

### 全局注册

```js
import Vue from 'vue'
import V2Plus from 'v2plus'
import 'v2plus/dist/v2plus.css'

Vue.use(V2Plus)
```

### 按需引入

```js
import { Table, TableColumn } from 'v2plus'
import 'v2plus/dist/v2plus.css'

export default {
  components: { Table, TableColumn }
}
```

## 本地开发

```bash
# 安装依赖
npm install

# 文档站点
npm run docs:dev

# 构建组件库
npm run build
```

## License

MIT
