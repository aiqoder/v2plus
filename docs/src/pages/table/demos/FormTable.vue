<template>
  <div>
    <h3>模式：batch（批量编辑）</h3>
    <p>默认 view 态，多选后点"批量编辑"进入编辑。省市区三级联动下拉</p>
    <v2-table
      ref="batchTable"
      :data="batchData"
      :form="{ editMode: 'batch' }"
      row-key="id"
      border
      stripe
      style="width: 100%"
      @form-change="handleFormChange"
    >
      <v2-table-column type="selection" width="50" />
      <v2-table-column prop="province" label="省" width="140">
        <template #edit="{ row, value, setValue }">
          <select :value="value" class="batch-select" @change="onProvinceChange(row, $event.target.value, setValue)">
            <option value="">请选择省</option>
            <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
          </select>
        </template>
      </v2-table-column>
      <v2-table-column prop="city" label="市" width="140">
        <template #edit="{ row, value, setValue }">
          <select :value="value" class="batch-select" :disabled="!row.province" @change="onCityChange(row, $event.target.value, setValue)">
            <option value="">请选择市</option>
            <option v-for="c in getCities(row.province)" :key="c" :value="c">{{ c }}</option>
          </select>
        </template>
      </v2-table-column>
      <v2-table-column prop="district" label="区" width="140">
        <template #edit="{ row, value, setValue }">
          <select :value="value" class="batch-select" :disabled="!row.city" @change="e => setValue(e.target.value)">
            <option value="">请选择区</option>
            <option v-for="d in getDistricts(row.province, row.city)" :key="d" :value="d">{{ d }}</option>
          </select>
        </template>
      </v2-table-column>
      <v2-table-column prop="name" label="姓名" width="120"
        editor="input"
        :editor-props="{ placeholder: '请输入姓名' }"
        :rules="[{ required: true, message: '姓名必填' }]"
      />
      <v2-table-column prop="age" label="年龄" width="100"
        editor="number"
        :editor-props="{ min: 1, max: 150 }"
        :rules="[{ required: true, message: '请输入年龄' }]"
      />
      <v2-table-column label="地址" min-width="200">
        <template #default="{ row }">{{ row.province }} {{ row.city }} {{ row.district }}</template>
      </v2-table-column>
      <template #toolbar="{ startEdit, commitEdit, cancelEdit, selectionCount }">
        <button class="demo-btn" @click="startEdit()">{{ selectionCount ? '编辑选中(' + selectionCount + ')' : '全部编辑' }}</button>
        <button class="demo-btn" @click="commitEdit().then(r => alert(r.valid ? '保存成功' : '有校验错误'))">保存</button>
        <button class="demo-btn" @click="cancelEdit()">取消编辑</button>
      </template>
    </v2-table>

    <h3 style="margin-top: 40px;">模式：always（始终编辑）</h3>
    <p>表格挂载后所有行自动进入编辑态，省市区三级联动下拉</p>
    <v2-table
      ref="alwaysTable"
      :data="alwaysData"
      :form="{ editMode: 'always' }"
      border
      stripe
      style="width: 100%"
    >
      <v2-table-column prop="province" label="省" width="140">
        <template #edit="{ row, value, setValue }">
          <select :value="value" class="demo-select" @change="onProvinceChange(row, $event.target.value, setValue)">
            <option value="">请选择省</option>
            <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
          </select>
        </template>
      </v2-table-column>
      <v2-table-column prop="city" label="市" width="140">
        <template #edit="{ row, value, setValue }">
          <select :value="value" class="demo-select" :disabled="!row.province" @change="onCityChange(row, $event.target.value, setValue)">
            <option value="">请选择市</option>
            <option v-for="c in getCities(row.province)" :key="c" :value="c">{{ c }}</option>
          </select>
        </template>
      </v2-table-column>
      <v2-table-column prop="district" label="区" width="140">
        <template #edit="{ row, value, setValue }">
          <select :value="value" class="demo-select" :disabled="!row.city" @change="e => setValue(e.target.value)">
            <option value="">请选择区</option>
            <option v-for="d in getDistricts(row.province, row.city)" :key="d" :value="d">{{ d }}</option>
          </select>
        </template>
      </v2-table-column>
      <v2-table-column prop="name" label="姓名" width="120"
        editor="input" :rules="[{ required: true, message: '姓名必填' }]"
      />
      <v2-table-column prop="memo" label="备注"
        editor="textarea"
        :editor-props="{ rows: 2 }"
      />
      <template #toolbar="{ commitEdit, clearValidate }">
        <button class="demo-btn" @click="commitEdit().then(r => alert(r.valid ? '全部通过' : '有校验错误'))">提交校验</button>
        <button class="demo-btn" @click="clearValidate()">清除错误</button>
      </template>
    </v2-table>

    <h3 style="margin-top: 40px;">模式：row（单击行编辑）</h3>
    <p>单击行进入编辑态，省市区联动 + 添加/删除行</p>
    <v2-table
      ref="rowTable"
      :data="rowData"
      :form="{ editMode: 'row' }"
      border
      stripe
      style="width: 100%"
    >
      <v2-table-column type="index" label="#" width="50" />
      <v2-table-column prop="province" label="省" width="140">
        <template #edit="{ row, value, setValue }">
          <select :value="value" class="demo-select" @change="onProvinceChange(row, $event.target.value, setValue)">
            <option value="">请选择省</option>
            <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
          </select>
        </template>
      </v2-table-column>
      <v2-table-column prop="city" label="市" width="140">
        <template #edit="{ row, value, setValue }">
          <select :value="value" class="demo-select" :disabled="!row.province" @change="onCityChange(row, $event.target.value, setValue)">
            <option value="">请选择市</option>
            <option v-for="c in getCities(row.province)" :key="c" :value="c">{{ c }}</option>
          </select>
        </template>
      </v2-table-column>
      <v2-table-column prop="district" label="区" width="140">
        <template #edit="{ row, value, setValue }">
          <select :value="value" class="demo-select" :disabled="!row.city" @change="e => setValue(e.target.value)">
            <option value="">请选择区</option>
            <option v-for="d in getDistricts(row.province, row.city)" :key="d" :value="d">{{ d }}</option>
          </select>
        </template>
      </v2-table-column>
      <v2-table-column prop="name" label="姓名" width="120"
        editor="input" :rules="[{ required: true, message: '姓名必填' }]"
      />
      <v2-table-column label="操作" width="160" align="center">
        <template #default="{ row, editing, startEdit, commitEdit, cancelEdit, deleteRows }">
          <template v-if="editing">
            <a href="javascript:;" class="action-link" @click="commitEdit()">保存</a>
            <a href="javascript:;" class="action-link action-link--cancel" @click="cancelEdit()">取消</a>
          </template>
          <template v-else>
            <a href="javascript:;" class="action-link" @click="startEdit()">编辑</a>
            <a href="javascript:;" class="action-link action-link--danger" @click="deleteRows([row])">删除</a>
          </template>
        </template>
      </v2-table-column>
      <template #toolbar="{ startEdit }">
        <button class="demo-btn" @click="addRow">新增一行</button>
      </template>
    </v2-table>
  </div>
</template>

<script>
import { V2Table, V2TableColumn } from '@components/table'

const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省', '山东省']

const cityMap = {
  '北京市': ['北京市'],
  '上海市': ['上海市'],
  '广东省': ['广州市', '深圳市', '东莞市', '佛山市', '珠海市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市'],
  '江苏省': ['南京市', '苏州市', '无锡市', '常州市'],
  '四川省': ['成都市', '绵阳市', '德阳市'],
  '湖北省': ['武汉市', '宜昌市', '襄阳市'],
  '山东省': ['济南市', '青岛市', '烟台市'],
}

const districtMap = {
  '北京市-北京市': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区', '通州区', '大兴区'],
  '上海市-上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区'],
  '广东省-广州市': ['天河区', '越秀区', '海珠区', '荔湾区', '白云区', '番禺区', '花都区', '黄埔区'],
  '广东省-深圳市': ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区', '龙华区', '光明区', '坪山区'],
  '广东省-东莞市': ['莞城区', '南城区', '东城区', '万江区'],
  '广东省-佛山市': ['禅城区', '南海区', '顺德区', '高明区', '三水区'],
  '广东省-珠海市': ['香洲区', '斗门区', '金湾区'],
  '浙江省-杭州市': ['西湖区', '上城区', '拱墅区', '滨江区', '萧山区', '余杭区', '临平区', '钱塘区'],
  '浙江省-宁波市': ['海曙区', '江北区', '鄞州区', '北仑区', '镇海区', '奉化区'],
  '浙江省-温州市': ['鹿城区', '龙湾区', '瓯海区', '洞头区'],
  '浙江省-嘉兴市': ['南湖区', '秀洲区', '嘉善县', '海盐县'],
  '江苏省-南京市': ['玄武区', '秦淮区', '建邺区', '鼓楼区', '栖霞区', '雨花台区', '江宁区', '浦口区'],
  '江苏省-苏州市': ['姑苏区', '虎丘区', '吴中区', '相城区', '吴江区', '苏州工业园区'],
  '江苏省-无锡市': ['梁溪区', '锡山区', '惠山区', '滨湖区', '新吴区'],
  '江苏省-常州市': ['天宁区', '钟楼区', '新北区', '武进区', '金坛区'],
  '四川省-成都市': ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '龙泉驿区', '双流区', '郫都区'],
  '四川省-绵阳市': ['涪城区', '游仙区', '安州区'],
  '四川省-德阳市': ['旌阳区', '罗江区', '广汉市'],
  '湖北省-武汉市': ['武昌区', '洪山区', '江岸区', '江汉区', '硚口区', '汉阳区', '青山区', '东西湖区'],
  '湖北省-宜昌市': ['西陵区', '伍家岗区', '点军区', '猇亭区', '夷陵区'],
  '湖北省-襄阳市': ['襄城区', '樊城区', '襄州区'],
  '山东省-济南市': ['历下区', '市中区', '槐荫区', '天桥区', '历城区', '长清区'],
  '山东省-青岛市': ['市南区', '市北区', '黄岛区', '崂山区', '李沧区', '城阳区', '即墨区'],
  '山东省-烟台市': ['芝罘区', '福山区', '牟平区', '莱山区', '蓬莱区'],
}

const sampleData = [
  { id: 1, name: '张三', age: 28, province: '北京市', city: '北京市', district: '朝阳区', memo: '' },
  { id: 2, name: '李四', age: 32, province: '广东省', city: '深圳市', district: '南山区', memo: '' },
  { id: 3, name: '王五', age: 25, province: '浙江省', city: '杭州市', district: '西湖区', memo: '' },
  { id: 4, name: '赵六', age: 30, province: '四川省', city: '成都市', district: '武侯区', memo: '' },
]

export default {
  components: { V2Table, V2TableColumn },
  data() {
    return {
      provinces,
      batchData: JSON.parse(JSON.stringify(sampleData)),
      alwaysData: JSON.parse(JSON.stringify(sampleData)),
      rowData: JSON.parse(JSON.stringify(sampleData)),
    }
  },
  methods: {
    handleFormChange(changedRows) {
      console.log('form-change:', changedRows)
    },
    getCities(province) {
      return province ? (cityMap[province] || []) : []
    },
    getDistricts(province, city) {
      if (!province || !city) return []
      return districtMap[`${province}-${city}`] || []
    },
    onProvinceChange(row, value, setValue) {
      setValue(value)
      row.city = ''
      row.district = ''
    },
    onCityChange(row, value, setValue) {
      setValue(value)
      row.district = ''
    },
    addRow() {
      this.rowData.push({ id: Date.now(), name: '', province: '', city: '', district: '', memo: '' })
      this.$nextTick(() => {
        if (this.$refs.rowTable) {
          this.$refs.rowTable.startEdit([this.rowData[this.rowData.length - 1]])
        }
      })
    },
  },
}
</script>

<style scoped>
.demo-btn {
  padding: 4px 12px;
  border: 1px solid var(--brand-color, #409eff);
  background: var(--brand-color, #409eff);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.demo-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.demo-btn:hover:not(:disabled) { opacity: 0.85; }
.demo-select {
  width: 100%;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  outline: none;
  box-sizing: border-box;
}
.demo-select:focus { border-color: var(--brand-color, #409eff); }
.demo-select:disabled { background: #f5f7fa; color: #c0c4cc; cursor: not-allowed; }
.batch-select {
  width: 100%;
  height: 28px;
  padding: 0 6px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  font-size: 12px;
  background: #fff;
  outline: none;
  box-sizing: border-box;
}
.batch-select:focus { border-color: var(--brand-color, #409eff); }
.batch-select:disabled { background: #f5f7fa; color: #c0c4cc; cursor: not-allowed; }
.action-link {
  color: var(--brand-color, #409eff);
  text-decoration: none;
  margin: 0 6px;
  font-size: 13px;
  cursor: pointer;
}
.action-link--cancel { color: #909399; }
.action-link--danger { color: #f56c6c; }
</style>
