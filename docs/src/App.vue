<template>
  <div class="doc-app">
    <!-- 侧边栏 — 对照 Element Plus sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-groups">
        <doc-sidebar :items="navItems" @close="sidebarOpen = false" />
      </div>
    </aside>

    <!-- 蒙层 — 对照 overlay.scss -->
    <div v-if="sidebarOpen" class="overlay" @click="sidebarOpen = false" />

    <!-- 移动端子导航 — 对照 subnav.scss -->
    <div class="sub-nav">
      <button class="toggle-sidebar-btn" @click="sidebarOpen = !sidebarOpen">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>
        <span>菜单</span>
      </button>
    </div>

    <!-- 内容区 — 对照 content.scss + doc-content.scss -->
    <main class="page-content has-sidebar">
      <div class="doc-content-wrapper">
        <div class="doc-content-container">
          <div class="doc-content" style="position: relative;">
            <router-view />
          </div>
          <page-footer edit-link="https://github.com/element-plus/element-plus/edit/dev/docs/en-US/component/table.md" />
          <prev-next-nav />
        </div>
        <doc-toc />
      </div>
    </main>
  </div>
</template>

<script>
import DocSidebar from './components/Sidebar.vue'
import DocToc from './components/Toc.vue'
import PageFooter from './components/PageFooter.vue'
import PrevNextNav from './components/PrevNextNav.vue'

export default {
  name: 'DocsApp',
  components: { DocSidebar, DocToc, PageFooter, PrevNextNav },
  data() {
    return {
      sidebarOpen: false,
      navItems: [
        {
          title: '开发指南',
          items: [
            { text: '快速开始', link: '/' },
          ],
        },
        {
          title: '组件',
          items: [
            { text: 'Table 表格', link: '/table' },
          ],
        },
      ],
    }
  },
  watch: {
    '$route'() { if (window.innerWidth < 960) this.sidebarOpen = false },
  },
  created() {
    window.addEventListener('resize', this.onResize)
    this.onResize()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onResize() {
      this.isMobile = window.innerWidth < 960
    },
  },
}
</script>

<style lang="scss">
/* ===========================================================
   精确副本 — 直接翻译自 Element Plus 源码:
   docs/.vitepress/vitepress/styles/*.scss
   =========================================================== */

/* ---- css-vars.scss — 完整复制 ---- */
:root {
  --vp-screen-max-width: 1376px;
  --vp-content-width: 800px;
  --text-color: var(--el-text-color-primary);
  --text-color-light: var(--el-text-color-regular);
  --text-color-lighter: var(--el-text-color-secondary);
  --brand-color: var(--el-color-primary);
  --brand-color-light: var(--el-color-primary-light-1);
  --bg-brand-color: var(--el-color-primary-light-9);
  --bg-color: var(--el-bg-color);
  --bg-color-rgb: 255, 255, 255;
  --bg-color-soft: #fafafa;
  --bg-color-mute: #f2f2f2;
  --border-color: var(--el-border-color);
  --border-color-light: var(--el-border-color-lighter);
  --font-family: var(--el-font-family);
  --font-family-mono: 'JetBrains Mono', source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  --success-color: var(--el-color-success);
  --warning-color: var(--el-color-warning);
  --danger-color: var(--el-color-danger);
  --purple-color: #6222c2;
  --purple-color-light: #9065db;
  --header-height: 55px;
  --nav-height: 55px;
  --vp-sidebar-width-mobile: 320px;
  --vp-sidebar-width-small: 266px;
  --sidebar-width-sm: 16rem;
  --sidebar-width-xs: 20rem;
  --content-min-width: 16rem;
  --content-max-width: 48rem;
  --nav-z-index: 12;
  --sub-nav-z-index: 11;
  --sidebar-z-index: 11;
  --sidebar-z-index-mobile: 31;
  --overlay-z-index: 30;
  --code-line-height: 1.4;
  --code-font-size: var(--el-font-size-base);
  --code-bg-color: var(--el-fill-color-light);
  --code-text-color: var(--text-color);
  --code-font-family: var(--font-family-mono);
  --code-tooltip-bg-color: var(--code-bg-color);
  --code-tooltip-color: #0c61c9;
  --block-tip-bg-color: rgba(var(--el-color-primary-rgb), 0.1);
  --block-warning-bg-color: rgba(var(--el-color-danger-rgb), 0.1);
  --link-active-bg-color: rgba(var(--el-color-primary-rgb), 0.1);

  /* Element Plus 基础 tokens — 引用自 packages/theme-chalk */
  --el-color-primary: #409eff;
  --el-color-primary-rgb: 64, 158, 255;
  --el-color-primary-light-1: #66b1ff;
  --el-color-primary-light-9: #ecf5ff;
  --el-color-success: #67c23a;
  --el-color-warning: #e6a23c;
  --el-color-danger: #f56c6c;
  --el-color-danger-rgb: 245, 108, 108;
  --el-text-color-primary: #303133;
  --el-text-color-regular: #606266;
  --el-text-color-secondary: #909399;
  --el-border-color: #dcdfe6;
  --el-border-color-lighter: #ebeef5;
  --el-bg-color: #ffffff;
  --el-fill-color-light: #f5f7fa;
  --el-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  --el-font-size-base: 14px;
  --el-border-radius-base: 4px;
  --el-transition-duration-fast: 0.2s;

  /* code.scss — 代码块变量 */
  --vp-code-block-bg: var(--el-fill-color-light);
  --vp-code-line-height: 1.6;
  --vp-code-font-size: var(--el-font-size-base);
  --vp-code-block-color: var(--text-color);
  --vp-code-link-color: var(--brand-color);
  --vp-code-link-hover-color: var(--brand-color-light);
  --vp-code-copy-code-border-color: var(--border-color);
  --vp-code-copy-code-bg: var(--bg-color);
  --vp-code-copy-code-hover-border-color: var(--border-color);
  --vp-code-copy-code-hover-bg: var(--bg-color);
  --vp-code-copy-code-active-text: var(--text-color-lighter);
}

/* xxl → 1440px, max → 1680px (vars.scss breakpoints) */
@media screen and (min-width: 1440px) {
  :root { --vp-sidebar-width-small: 234px; }
}
@media screen and (min-width: 1680px) {
  :root { --vp-screen-max-width: 1482px; --vp-sidebar-width-small: 290px; }
}

/* ---- base.scss — 完整复制 ---- */
*, ::before, ::after { box-sizing: border-box; }

html {
  line-height: 1.4;
  font-size: 16px;
  text-size-adjust: 100%;
  font-family: var(--font-family);
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}

body {
  margin: 0;
  width: 100%;
  min-width: 320px;
  min-height: 100vh;
  line-height: 1.4;
  font-size: 16px;
  font-weight: 400;
  color: var(--text-color);
  background-color: var(--bg-color);
  direction: ltr;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color var(--el-transition-duration-fast);
}

main { display: block; }

h1, h2, h3, h4, h5, h6 { margin: 0; line-height: 1.25; }

.doc-content h1, .doc-content h2, .doc-content h3,
.doc-content h4, .doc-content h5, .doc-content h6 {
  display: flex; align-items: center; position: relative;

  .el-tag, .vp-tag { margin-left: 8px; }
}

h1, h2, h3, h4, h5, h6, strong, b { font-weight: 600; }

h1 { margin-top: 1.5rem; margin-bottom: 2rem; font-size: 1.9rem; }
@media screen and (min-width: 480px) { h1 { font-size: 2.2rem; } }

h2 {
  margin-top: 2.25rem; margin-bottom: 1.25rem; padding-bottom: 0.3rem;
  line-height: 1.25; font-size: 1.65rem;
}

h2 + h3 { margin-top: 1.5rem; }

h3 { margin-top: 2rem; font-size: 1.35rem; }
h4 { font-size: 1.15rem; }

p, ol, ul { margin: 1rem 0; line-height: 1.7; }

a { font-weight: 500; text-decoration: inherit; color: var(--brand-color); }
figure { margin: 0; }
img { max-width: 100%; }
li > ul, li > ol { margin: 0; }

/* 表格 — 精确复制 base.scss .vp-table */
.doc-content > div .vp-table {
  width: 100%; overflow-y: hidden; overflow-x: auto; margin-bottom: 45px;

  & > table {
    border-collapse: collapse; width: 100%;
    background-color: var(--bg-color); font-size: 14px; line-height: 1.5em;

    tr td:nth-child(2) { font-family: var(--font-family); }

    th, td {
      white-space: nowrap; border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color); padding: 0.6em 1em;
      text-align: left; max-width: 250px; white-space: pre-wrap;
    }

    thead tr:first-child th { border-top: none; }
    tbody tr td:first-child { font-family: var(--font-family-mono); }
  }
}

blockquote {
  margin: 1rem 0; border-left: 0.2rem solid var(--el-border-color);
  padding: 0.25rem 0 0.25rem 1rem; font-size: 1rem; color: var(--text-color-lighter);
  > p { margin: 0; }
}

.custom-block {
  .custom-block-title { font-weight: 700; }
  p:not(.custom-block-title) { font-size: 0.9rem; }

  &.tip {
    padding: 8px 16px; background-color: var(--block-tip-bg-color);
    border-radius: 4px; border-left: 5px solid var(--el-color-primary); margin: 20px 0;
  }
  &.warning {
    padding: 8px 16px; background-color: var(--block-warning-bg-color);
    border-radius: 4px; border-left: 5px solid var(--el-color-danger); margin: 20px 0;
  }
}

/* ---- code.scss — 完整复制 ---- */
pre, code, kbd, samp { font-family: var(--code-font-family); }

:not(pre) > code {
  border-radius: 4px; padding: 0.15rem 0.5rem;
  background-color: var(--el-fill-color-light);
  transition: color 0.25s, background-color 0.5s; font-size: 14px;
}

.doc-content a > code { color: var(--vp-code-link-color); }
.doc-content a:hover > code { color: var(--vp-code-link-hover-color); }
.doc-content h1 > code, .doc-content h2 > code, .doc-content h3 > code { font-size: 0.9em; }

.doc-content div[class*='language-'], .vp-block {
  position: relative; margin: 16px 0; background-color: var(--vp-code-block-bg);
  overflow-x: auto; transition: background-color 0.5s;
}

@media (min-width: 640px) { .doc-content div[class*='language-'], .vp-block { border-radius: 8px; } }
@media (max-width: 639px) { .doc-content li div[class*='language-'] { border-radius: 8px 0 0 8px; } }

.doc-content [class*='language-'] pre, .doc-content [class*='language-'] code {
  direction: ltr; text-align: left; white-space: pre; word-spacing: normal;
  word-break: normal; word-wrap: normal; tab-size: 4; hyphens: none;
}

.doc-content [class*='language-'] pre {
  position: relative; z-index: 1; margin: 0; padding: 20px 0;
  background: transparent; overflow-x: auto;
}

.doc-content [class*='language-'] code {
  display: block; padding: 0 24px; width: fit-content; min-width: 100%;
  line-height: var(--vp-code-line-height); font-size: var(--vp-code-font-size);
  color: var(--vp-code-block-color); transition: color 0.5s;
}

/* ---- sidebar.scss — 完整复制 ---- */
.sidebar {
  position: fixed; top: 0; bottom: 0; left: 0;
  width: var(--sidebar-width-xs);
  background-color: var(--bg-color);
  padding: 48px 32px; overflow-y: auto;
  transform: translate(-100%);
  transition: background-color var(--el-transition-duration-fast), opacity 0.25s,
    transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);

  &.open { transform: translate(0); }

  .sidebar-groups {
    padding: 0 2px;

    .sidebar-group__title {
      font-size: 1rem; font-weight: 700; margin-bottom: 8px; line-height: 24px;
    }

    .sidebar-group + .sidebar-group { padding-top: 24px; }
  }

  @media (max-width: 767px) {
    width: calc(var(--vp-sidebar-width-mobile) - 14px);
    z-index: var(--sidebar-z-index-mobile);
  }

  @media screen and (min-width: 768px) {
    width: calc(var(--vp-sidebar-width-small));
    z-index: var(--sidebar-z-index-mobile);
  }

  @media screen and (min-width: 960px) {
    z-index: var(--sidebar-z-index); top: var(--header-height);
    transform: translate(0);
  }

  @media screen and (min-width: 1440px) {
    padding: 48px 32px; width: calc(var(--vp-sidebar-width-small) + 32px);
  }

  @media screen and (min-width: 1680px) {
    padding: 48px; width: calc(var(--vp-sidebar-width-small) + 48px);
  }
}

/* ---- content.scss + doc-content.scss — 完整复制 ---- */
.page-content { outline: none; }

@media screen and (min-width: 960px) {
  .page-content { padding-top: var(--nav-height); }

  .page-content.has-sidebar {
    padding-left: calc(var(--sidebar-width-sm) + 10px);

    @media screen and (min-width: 1280px) {
      padding-left: calc(var(--vp-sidebar-width-small));
    }
    @media screen and (min-width: 1440px) {
      padding-left: calc(var(--vp-sidebar-width-small) + 32px);
    }
    @media screen and (min-width: 1680px) {
      padding-left: calc(var(--vp-sidebar-width-small) + 48px);
    }
  }
}

.page-content .doc-content a {
  display: inline-flex; align-items: center;
  &.vp-link { white-space: nowrap; }
}

.doc-content-wrapper {
  padding: 32px 24px;

  @media screen and (min-width: 768px) { padding: 48px 32px; }
  @media screen and (min-width: 960px) { padding: 48px 32px; }
  @media screen and (min-width: 1440px) {
    padding: 64px 0 48px 64px;
    display: flex;
    gap: 0;
  }
  @media screen and (min-width: 1680px) {
    padding: 64px 0 48px 64px;
    display: flex;
    gap: 0;
  }
}

.doc-content-container {
  width: 100%;

  @media screen and (min-width: 1440px) {
    max-width: var(--vp-content-width);
    min-width: var(--vp-content-width);
  }
}

.doc-content {
  width: 100%;

  /* 标题锚点链接 — 对照 header-anchor */
  .header-anchor {
    opacity: 0;
    margin-left: 8px;
    font-size: 0.85em;
    color: var(--brand-color);
    transition: opacity 0.25s;
  }

  h1:hover .header-anchor,
  h2:hover .header-anchor,
  h3:hover .header-anchor,
  h4:hover .header-anchor,
  h5:hover .header-anchor,
  h6:hover .header-anchor {
    opacity: 1;
  }
}

/* ---- overlay.scss — 完整复制 ---- */
.overlay {
  position: fixed; top: 0; right: 0; bottom: 0; left: 0;
  background: rgba(0, 0, 0, 0.6); transition: opacity 0.5s;
  z-index: var(--overlay-z-index);
}

/* ---- subnav.scss — 完整复制 ---- */
.sub-nav {
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color); color: var(--text-color);
  transition: border-color var(--el-transition-duration),
    background-color var(--el-transition-duration-fast);
  position: sticky; top: 0; left: 0; width: 100%;
  display: flex; padding: 0 32px; justify-content: space-between;
  z-index: var(--sub-nav-z-index); overflow: hidden;

  @media (max-width: 767px) { padding: 0 24px; }
  @media screen and (min-width: 960px) { display: none !important; }
}

.toggle-sidebar-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 12px 0; border: none; background: transparent;
  color: var(--text-color-light); font-size: 14px;
  font-family: inherit; cursor: pointer;
}

/* ---- scrollbar.scss — 完整复制 ---- */
* { scrollbar-color: var(--el-scrollbar-bg-color) var(--el-fill-color-light); }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar:horizontal { height: 6px; }
::-webkit-scrollbar-track { border-radius: 10px; }
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2); border-radius: 10px;
  transition: all 0.2s ease-in-out;
  &:hover { cursor: pointer; background-color: rgba(0, 0, 0, 0.3); }
}
</style>
