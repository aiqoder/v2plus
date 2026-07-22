<template>
  <footer class="page-footer">
    <div class="edit">
      <div class="edit-link">
        <a
          class="link"
          :href="editLink"
          target="_blank"
          rel="noopener noreferrer"
        >
          Edit this page on GitHub
          <svg
            class="external-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="currentColor"
          >
            <path
              d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm11-3v8h-2V6.413l-7.793 7.794l-1.414-1.414L17.585 5H13V3z"
            />
          </svg>
        </a>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'PageFooter',
  props: {
    editLink: {
      type: String,
      default: 'https://github.com/element-plus/element-plus/edit/dev/docs/en-US/component/table.md',
    },
  },
}
</script>

<style lang="scss" scoped>
/* ========================================
   精确对照 Element Plus 源码
   docs/.vitepress/vitepress/components/vp-page-footer.vue
   ======================================== */

.page-footer {
  padding: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit {
  display: flex;
  align-items: center;
}

.edit-link {
  display: flex;
  align-items: center;
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

  &:hover {
    color: var(--brand-color);
  }
}

.external-icon {
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
