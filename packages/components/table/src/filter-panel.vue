<template>
  <transition name="v2-table-filter">
    <div
      v-show="visible"
      class="v2-table__filter-panel"
      :class="panelClass"
      :style="panelStyle"
    >
      <div class="v2-table__filter-panel-content">
        <div class="v2-table__filter-panel-body">
          <template v-if="column.filterMultiple !== false">
            <!-- 多选筛选 -->
            <div class="v2-table__filter-checkall">
              <label>
                <input
                  type="checkbox"
                  :checked="isAllChecked"
                  :indeterminate.prop="isIndeterminate"
                  @change="toggleAll"
                />
                <span>全选</span>
              </label>
            </div>
            <div
              v-for="filter in column.filters"
              :key="filter.value"
              class="v2-table__filter-item"
            >
              <label>
                <input
                  type="checkbox"
                  :checked="isChecked(filter.value)"
                  @change="toggleFilter(filter.value)"
                />
                <span>{{ filter.text }}</span>
              </label>
            </div>
          </template>
          <template v-else>
            <!-- 单选筛选 -->
            <div
              v-for="filter in column.filters"
              :key="filter.value"
              class="v2-table__filter-item"
            >
              <label>
                <input
                  type="radio"
                  :value="filter.value"
                  :checked="isChecked(filter.value)"
                  name="table-filter-radio"
                  @change="selectFilter(filter.value)"
                />
                <span>{{ filter.text }}</span>
              </label>
            </div>
          </template>
        </div>
        <div class="v2-table__filter-panel-footer">
          <button class="v2-table__filter-btn" @click="confirm">确定</button>
          <button class="v2-table__filter-btn is-plain" @click="reset">重置</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'V2TableFilterPanel',

  props: {
    visible: { type: Boolean, default: false },
    column: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      selectedValues: [],
    }
  },

  computed: {
    panelClass() {
      return this.column.filterClassName || ''
    },
    panelStyle() {
      return {}
    },
    isAllChecked() {
      if (!this.column.filters) return false
      return this.selectedValues.length === this.column.filters.length
    },
    isIndeterminate() {
      if (!this.column.filters) return false
      return this.selectedValues.length > 0 && this.selectedValues.length < this.column.filters.length
    },
  },

  watch: {
    visible(val) {
      if (val) {
        this.selectedValues = [...(this.column.filteredValue || [])]
      }
    },
  },

  methods: {
    isChecked(value) {
      return this.selectedValues.includes(value)
    },
    toggleFilter(value) {
      const idx = this.selectedValues.indexOf(value)
      if (idx > -1) {
        this.selectedValues.splice(idx, 1)
      } else {
        this.selectedValues.push(value)
      }
    },
    selectFilter(value) {
      this.selectedValues = [value]
    },
    toggleAll() {
      if (this.isAllChecked && !this.isIndeterminate) {
        this.selectedValues = []
      } else {
        this.selectedValues = this.column.filters.map((f) => f.value)
      }
    },
    confirm() {
      this.$emit('confirm', this.selectedValues)
    },
    reset() {
      this.selectedValues = []
      this.$emit('confirm', [])
    },
  },
}
</script>
