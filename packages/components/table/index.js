/**
 * Table 组件入口
 */
import { withInstall } from '../../v2plus/component'
import Table from './src/table.vue'
import TableColumn from './src/table-column.vue'
import TableFilterRow from './src/table-filter-row.vue'

const V2Table = withInstall(Table)
const V2TableColumn = withInstall(TableColumn)
const V2TableFilterRow = withInstall(TableFilterRow)

export { V2Table, V2TableColumn, V2TableFilterRow }
export default V2Table
