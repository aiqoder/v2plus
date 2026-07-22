<template>
  <div v-if="items.length" class="toc-wrapper">
    <div class="toc">
      <h4 class="toc-title">目录</h4>
      <ul class="toc-list">
        <li
          v-for="(item, i) in items"
          :key="i"
          :class="['toc-item', { active: activeIndex === i }, { 'is-h3': item.level === 3 }]"
        >
          <a
            class="toc-link"
            :href="`#${item.id}`"
            @click.prevent="scrollTo(item.id)"
          >{{ item.text }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocToc',
  data() {
    return {
      items: [],
      activeIndex: 0,
      observer: null,
    }
  },
  mounted() {
    // 延迟提取，等待异步路由组件渲染完成
    this.scheduleExtract()
  },
  beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
    if (this._extractTimer) {
      clearTimeout(this._extractTimer)
    }
  },
  watch: {
    '$route'() {
      this.items = []
      if (this.observer) {
        this.observer.disconnect()
        this.observer = null
      }
      this.scheduleExtract()
    },
  },
  methods: {
    scheduleExtract() {
      // 多次尝试提取，因为异步路由组件可能较慢
      const tryExtract = (attempts) => {
        this.extractHeadings()
        if (this.items.length > 0) {
          this.setupObserver()
          return
        }
        if (attempts > 1) {
          this._extractTimer = setTimeout(() => tryExtract(attempts - 1), 100)
        }
      }
      this.$nextTick(() => tryExtract(10))
    },

    extractHeadings() {
      // 从 .doc-content 中提取 h2/h3 标题
      const container = document.querySelector('.doc-content')
      if (!container) return

      const headings = container.querySelectorAll('h2, h3')
      this.items = Array.from(headings).map((h, index) => {
        // 确保每个标题有 id
        if (!h.id) {
          h.id = `heading-${index}`
        }
        return {
          id: h.id,
          text: h.textContent.replace(/#$/, '').trim(),
          level: parseInt(h.tagName.charAt(1)),
        }
      })
    },

    setupObserver() {
      const container = document.querySelector('.doc-content')
      if (!container) return

      const headingElements = container.querySelectorAll('h2, h3')
      if (!headingElements.length) return

      this.observer = new IntersectionObserver(
        (entries) => {
          // 找第一个进入视口的标题
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const id = entry.target.id
              const index = this.items.findIndex((item) => item.id === id)
              if (index !== -1) {
                this.activeIndex = index
              }
              break
            }
          }
        },
        {
          rootMargin: '-80px 0px -60% 0px',
          threshold: 0,
        }
      )

      headingElements.forEach((el) => this.observer.observe(el))
    },

    scrollTo(id) {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
/* ========================================
   精确对照 Element Plus 源码
   docs/.vitepress/vitepress/styles/toc.scss
   ======================================== */

.toc-wrapper {
  position: relative;
  display: none;

  @media screen and (min-width: 1280px) {
    display: block;
  }
}

.toc {
  position: sticky;
  top: calc(var(--header-height) + 32px);
  padding-left: 64px;
  min-width: 200px;
  max-width: 260px;
  overflow-y: auto;
  max-height: calc(100vh - var(--header-height) - 64px);
}

.toc-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
  line-height: 20px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}

.toc-item {
  position: relative;

  &.is-h3 {
    padding-left: 12px;
  }
}

.toc-link {
  display: block;
  padding: 4px 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--text-color-lighter);
  text-decoration: none;
  transition: color 0.25s;
  border-left: 2px solid transparent;
  padding-left: 12px;
  margin-left: -14px;

  &:hover {
    color: var(--brand-color);
  }
}

.toc-item.active .toc-link {
  color: var(--brand-color);
  border-left-color: var(--brand-color);
}
</style>
