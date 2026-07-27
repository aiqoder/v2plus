// TreeSelect 文档示例共享数据

// 标准树数据（value / label / children）
export const treeData = [
  {
    value: '1',
    label: '一级 1',
    children: [
      {
        value: '1-1',
        label: '二级 1-1',
        children: [{ value: '1-1-1', label: '三级 1-1-1' }],
      },
    ],
  },
  {
    value: '2',
    label: '一级 2',
    children: [
      {
        value: '2-1',
        label: '二级 2-1',
        children: [
          { value: '2-1-1', label: '三级 2-1-1' },
          { value: '2-1-2', label: '三级 2-1-2' },
        ],
      },
      { value: '2-2', label: '二级 2-2' },
    ],
  },
  {
    value: '3',
    label: '一级 3',
    children: [
      { value: '3-1', label: '二级 3-1' },
      { value: '3-2', label: '二级 3-2' },
    ],
  },
]

// 带禁用节点的数据
export const disabledTreeData = [
  {
    value: '1',
    label: '一级 1（禁用）',
    disabled: true,
    children: [{ value: '1-1', label: '二级 1-1', disabled: true }],
  },
  {
    value: '2',
    label: '一级 2',
    children: [
      { value: '2-1', label: '二级 2-1' },
      { value: '2-2', label: '二级 2-2' },
    ],
  },
  { value: '3', label: '一级 3' },
]

// 自定义字段映射的数据（node-key=id、label=name）
export const customFieldTreeData = [
  {
    id: 1,
    name: '研发中心',
    children: [
      { id: 11, name: '前端组' },
      { id: 12, name: '后端组' },
    ],
  },
  {
    id: 2,
    name: '产品中心',
    children: [{ id: 21, name: '设计组' }],
  },
]
