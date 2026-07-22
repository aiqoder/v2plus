<template>
  <div class="api-section">
    <h3 :id="id" class="api-title">{{ title }}</h3>
    <div class="vp-table">
      <table>
        <thead>
          <tr>
            <th v-for="h in headers" :key="h">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in data" :key="i">
            <td v-for="h in headers" :key="h">
              <template v-if="h === '名称' || h === '参数' || h === 'Name' || h === 'Parameter'">
                {{ row[h] || '—' }}
              </template>
              <template v-else>
                {{ row[h] || '—' }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApiTable',
  props: {
    title: { type: String, default: '' },
    id: { type: String, default: '' },
    headers: { type: Array, default: () => ['名称', '说明', '类型', '默认值'] },
    data: { type: Array, default: () => [] },
  },
}
</script>

<style lang="scss" scoped>
/* ========================================
   精确对照 Element Plus 源码 base.scss .vp-table > table
   ======================================== */
.api-section {
  margin: 32px 0;
}

.api-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 16px;
}

.vp-table {
  width: 100%;
  overflow-y: hidden;
  overflow-x: auto;
  margin-bottom: 45px;

  > table {
    border-collapse: collapse;
    width: 100%;
    background-color: var(--bg-color);
    font-size: 14px;
    line-height: 1.5em;

    th, td {
      white-space: nowrap;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      padding: 0.6em 1em;
      text-align: left;
      max-width: 250px;
      white-space: pre-wrap;
    }

    thead tr:first-child th {
      border-top: none;
    }

    tbody tr td:first-child {
      font-family: var(--font-family-mono);
    }
  }
}
</style>
