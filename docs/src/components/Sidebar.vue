<template>
  <nav>
    <div v-for="section in items" :key="section.title" class="sidebar-group">
      <h3 class="sidebar-group__title">{{ section.title }}</h3>
      <div v-for="item in section.items" :key="item.link">
        <!-- 父级导航 — 对照 vp-sidebar-link.vue -->
        <router-link
          v-if="!item.children"
          :to="item.link"
          class="link"
          active-class="active"
          exact
          @click.native="$emit('close')"
        >
          <p class="link-text">{{ item.text }}</p>
        </router-link>

        <!-- 可展开的父项 -->
        <template v-else>
          <button
            class="link parent-link"
            :class="{ open: isOpen(item) }"
            @click="toggle(item)"
          >
            <p class="link-text">{{ item.text }}</p>
            <svg class="parent-arrow" viewBox="0 0 24 24" width="14" height="14">
              <path d="M9 5l8 7-8 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div v-show="isOpen(item)" class="sidebar-children">
            <router-link
              v-for="child in item.children"
              :key="child.link"
              :to="child.link"
              class="link child-link"
              active-class="active"
              @click.native="$emit('close')"
            >
              <p class="link-text">{{ child.text }}</p>
            </router-link>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'DocSidebar',
  props: {
    items: { type: Array, default: () => [] },
  },
  data() {
    return { openSections: {} }
  },
  methods: {
    isOpen(item) {
      if (this.$route.path.startsWith(item.link)) return true
      return !!this.openSections[item.link]
    },
    toggle(item) {
      this.$set(this.openSections, item.link, !this.openSections[item.link])
    },
  },
}
</script>

<style lang="scss" scoped>
/* ========================================
   精确对照 Element Plus 源码:
   - sidebar.scss (.sidebar-group__title)
   - vp-sidebar-link.vue (.link, .link-text, .active)
   ======================================== */

/* 分组 — 对照 sidebar.scss */
.sidebar-group {
  & + .sidebar-group { padding-top: 24px; }
}

.sidebar-group__title {
  font-size: 1rem;          /* 16px — 对照 1rem */
  font-weight: 700;          /* 对照 700 */
  margin-bottom: 8px;        /* 对照 8px */
  line-height: 24px;         /* 对照 24px */
  color: var(--text-color);
}

/* 链接 — 精确对照 vp-sidebar-link.vue .link */
.link:not(.flex) { display: block; }

.link {
  display: block;
  padding: 10px 16px;        /* 对照 10px 16px */
  line-height: 1.5;           /* 对照 1.5 */
  font-size: 0.9rem;          /* 对照 0.9rem */
  border-radius: 8px;         /* 对照 8px */
  text-decoration: none;
  cursor: pointer;
  border: none;
  width: 100%;
  text-align: left;
  background: transparent;
  font-family: inherit;
}

.link:hover .link-text {
  color: var(--brand-color);  /* 对照 var(--brand-color) */
  transition: color 0.25s;
}

.link.active {
  background-color: var(--link-active-bg-color); /* 对照 rgba(primary-rgb, 0.1) */

  .link-text {
    font-weight: 600;           /* 对照 600 */
    color: var(--brand-color);  /* 对照 var(--brand-color) */
    transition: color 0.25s;
  }
}

.link-text {
  margin: 0;
  line-height: 20px;           /* 对照 20px */
  font-size: 13px;             /* 对照 13px */
  font-weight: 500;            /* 对照 500 */
  color: var(--text-color-light); /* 对照 var(--text-color-light) */
  transition: color 0.5s;
}

/* 可展开父项 */
.parent-link {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.open {
    .link-text { color: var(--text-color); font-weight: 600; }
  }
}

.parent-arrow {
  flex-shrink: 0;
  transition: transform 0.2s;
  opacity: 0.4;
}

.parent-link.open .parent-arrow {
  transform: rotate(90deg);
}

/* 子项 */
.sidebar-children {
  padding-left: 4px;
}

.child-link {
  padding-left: 28px;          /* 子项额外缩进 */
}
</style>
