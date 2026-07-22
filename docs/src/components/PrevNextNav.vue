<template>
  <nav v-if="prev || next" class="next-and-prev-link">
    <div class="container">
      <div v-if="prev" class="prev">
        <router-link :to="prev.link" class="link">
          <svg
            class="arrow"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="currentColor"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span class="text">{{ prev.text }}</span>
        </router-link>
      </div>
      <div v-if="next" class="next">
        <router-link :to="next.link" class="link">
          <span class="text">{{ next.text }}</span>
          <svg
            class="arrow"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="currentColor"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'PrevNextNav',
  computed: {
    prev() {
      return this.$route.meta.prev || null
    },
    next() {
      return this.$route.meta.next || null
    },
  },
}
</script>

<style lang="scss" scoped>
/* ========================================
   精确对照 Element Plus 源码
   docs/.vitepress/vitepress/components/vp-next-and-prev-link.vue
   ======================================== */

.next-and-prev-link {
  padding: 16px 0 0;
  border-top: 1px solid var(--border-color);
}

.container {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.prev,
.next {
  flex: 1;
  min-width: 0;
}

.next {
  text-align: right;
}

.link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color-lighter);
  text-decoration: none;
  transition: color 0.25s;
  max-width: 100%;

  &:hover {
    color: var(--brand-color);
  }

  .text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.arrow {
  flex-shrink: 0;
}
</style>
