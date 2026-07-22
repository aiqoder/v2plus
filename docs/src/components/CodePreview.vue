<template>
  <div class="example">
    <!-- Demo 渲染区 -->
    <div class="example-showcase">
      <component :is="demo" />
    </div>

    <!-- 分隔线 -->
    <div class="divider" />

    <!-- 操作栏 -->
    <div class="op-btns">
      <button class="op-btn" :aria-label="expanded ? '隐藏代码' : '查看代码'" @click="expanded = !expanded">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
      </button>
      <button class="op-btn" aria-label="复制代码" @click="copyCode">
        <svg v-if="!copied" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </button>
    </div>

    <!-- 源代码 -->
    <div v-show="expanded" class="example-source-wrapper">
      <div class="example-source">
        <pre><code class="language-html" v-html="highlightedSource" /></pre>
      </div>
    </div>

    <!-- 收起按钮 -->
    <div
      v-show="expanded"
      class="example-float-control"
      tabindex="0"
      role="button"
      @click="expanded = false"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
      </svg>
      <span>隐藏代码</span>
    </div>
  </div>
</template>

<script>
import Prism from 'prismjs'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-css'
import 'prismjs/themes/prism.css'

export default {
  name: 'CodePreview',
  props: {
    source: { type: String, default: '' },
    demo: { type: Object, default: null },
  },
  data() {
    return {
      expanded: false,
      copied: false,
    }
  },
  computed: {
    highlightedSource() {
      if (!this.source) return ''
      // Vue 单文件组件的代码以 <template> 开头，适合按 HTML 语法高亮
      return Prism.highlight(this.source, Prism.languages.markup, 'markup')
    },
  },
  methods: {
    copyCode() {
      navigator.clipboard.writeText(this.source).then(() => {
        this.copied = true
        setTimeout(() => { this.copied = false }, 2000)
      }).catch(() => {})
    },
  },
}
</script>

<style lang="scss" scoped>
/* ========================================
   精确对照 Element Plus 源码 vp-demo.vue
   ======================================== */

.example {
  border: 1px solid var(--border-color);
  border-radius: var(--el-border-radius-base);
  margin: 16px 0;

  .example-showcase {
    padding: 1.5rem;
    margin: 0.5px;
    background-color: var(--bg-color);
    border-radius: var(--el-border-radius-base);
    overflow: auto;
  }

  .divider {
    border-top: 1px solid var(--border-color-light);
  }

  .op-btns {
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 2.5rem;
    gap: 0;

    .op-btn {
      margin: 0 0.5rem;
      cursor: pointer;
      color: var(--text-color-lighter);
      transition: 0.2s;
      background: none;
      border: none;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;

      &:hover { color: var(--text-color); }
    }
  }

  .example-source-wrapper {
    border-top: 1px solid var(--border-color-light);
  }

  .example-source {
    background-color: var(--el-fill-color-light);

    pre {
      margin: 0;
      padding: 20px 0;
      background: transparent;
      overflow-x: auto;

      code {
        display: block;
        padding: 0 24px;
        width: fit-content;
        min-width: 100%;
        line-height: 1.6;
        font-size: 14px;
        font-family: var(--font-family-mono);
        color: var(--text-color);
        white-space: pre;
        background: transparent;
      }
    }
  }

  &-float-control {
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid var(--border-color);
    height: 44px;
    box-sizing: border-box;
    background-color: var(--bg-color);
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    margin-top: -1px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    position: sticky;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    gap: 10px;

    span {
      font-size: 14px;
      margin-left: 0;
    }

    &:hover { color: var(--el-color-primary); }
  }
}
</style>

<!-- Demo 辅助样式 — 全局，供各 demo 组件使用 -->
<style lang="scss">
.demo-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 15px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
  font-family: inherit;
  transition: 0.2s;
  &:hover {
    color: var(--brand-color);
    border-color: var(--brand-color-light);
    background: var(--bg-brand-color);
  }
}

.demo-tag {
  display: inline-block;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid var(--brand-color-light);
  background: var(--bg-brand-color);
  color: var(--brand-color);
  white-space: nowrap;
}
</style>
