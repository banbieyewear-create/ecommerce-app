# 电商管理系统 - 模块化重构方案

## 📁 项目结构

```
feishu-ecommerce-app/
├── frontend/
│   ├── src/
│   │   ├── components/          # 公共组件
│   │   │   ├── common/          # 通用组件
│   │   │   │   ├── StatCard.vue       # 统计卡片
│   │   │   │   ├── SearchBar.vue      # 搜索栏
│   │   │   │   ├── FilterBar.vue      # 筛选栏
│   │   │   │   ├── DataTable.vue      # 数据表格
│   │   │   │   └── Pagination.vue     # 分页器
│   │   │   ├── product/         # 商品相关组件
│   │   │   │   ├── ProductList.vue      # 商品列表
│   │   │   │   ├── ProductTable.vue     # 商品表格
│   │   │   │   ├── ProductCard.vue      # 商品卡片
│   │   │   │   ├── SkuList.vue          # SKU 列表
│   │   │   │   ├── ProductForm.vue      # 商品表单
│   │   │   │   └── SkuForm.vue          # SKU 表单
│   │   │   ├── purchase/        # 采购相关组件
│   │   │   ├── sales/           # 销售相关组件
│   │   │   └── files/           # 文件相关组件
│   │   ├── views/               # 页面视图
│   │   │   ├── products/        # 商品管理页面
│   │   │   ├── purchase/        # 采购管理页面
│   │   │   ├── sales/           # 销售管理页面
│   │   │   ├── files/           # 文件管理页面
│   │   │   └── reports/         # 数据报表页面
│   │   ├── stores/              # 状态管理 (Pinia)
│   │   │   ├── product.js       # 商品状态
│   │   │   ├── purchase.js      # 采购状态
│   │   │   ├── sales.js         # 销售状态
│   │   │   └── app.js           # 应用状态
│   │   ├── api/                 # API 接口
│   │   │   ├── product.js       # 商品 API
│   │   │   ├── purchase.js      # 采购 API
│   │   │   ├── sales.js         # 销售 API
│   │   │   └── feishu.js        # 飞书 API
│   │   ├── utils/               # 工具函数
│   │   │   ├── format.js        # 格式化函数
│   │   │   ├── validator.js     # 验证函数
│   │   │   └── constants.js     # 常量定义
│   │   ├── router/              # 路由配置
│   │   ├── App.vue              # 根组件
│   │   └── main.js              # 入口文件
│   └── package.json
└── README.md
```

---

## 🎯 核心模块设计

### 1. 商品管理模块 (Product Module)

**功能职责：**
- SPU（标准产品单元）管理
- SKU（库存量单位）管理
- 商品分类管理
- 商品图片管理
- 批量操作（导入/导出/上下架）

**数据结构：**
```javascript
// SPU 结构
{
  id: 'SPU-001',
  name: '无线蓝牙耳机',
  category: '3C 电子',
  brand: '品牌名',
  images: ['url1', 'url2'],
  platform: 'Temu',
  status: '销售中', // 销售中/缺货/停售/清仓
  remarks: '备注',
  createdAt: '2026-03-01',
  updatedAt: '2026-03-04',
  skus: [
    {
      id: 'SKU-001-W',
      sku: 'TM-001-W',
      specs: { color: '白色', size: '标准' },
      cost: 45,
      price: 19.99,
      stock: 300,
      stockOnWay: 100,
      weight: 0.15,
      barcode: '6901234567890'
    }
  ]
}
```

**组件列表：**
- `ProductList` - 商品列表容器
- `ProductTable` - 商品表格（支持展开 SKU）
- `ProductCard` - 商品卡片（网格视图）
- `SkuList` - SKU 列表（展开后显示）
- `ProductForm` - 商品新增/编辑表单
- `SkuForm` - SKU 新增/编辑表单
- `ProductImport` - 商品批量导入
- `ProductExport` - 商品批量导出

---

### 2. 采购管理模块 (Purchase Module)

**功能职责：**
- 采购单管理
- 供应商管理
- 采购入库
- 采购退货
- 采购对账

**数据结构：**
```javascript
// 采购单结构
{
  id: 'PO-20260304-001',
  orderNo: 'PO-20260304-001',
  supplierId: 'SUP-001',
  supplierName: '深圳 XX 电子',
  items: [
    {
      productId: 'SPU-001',
      skuId: 'SKU-001-W',
      quantity: 200,
      unitPrice: 45,
      totalAmount: 9000,
      receivedQty: 0,
      rejectedQty: 0
    }
  ],
  totalAmount: 9000,
  status: '待付款', // 待付款/已付款/已发货/部分入库/已完成/已取消
  expectedDate: '2026-03-10',
  actualDate: null,
  remarks: '备注'
}
```

**组件列表：**
- `PurchaseList` - 采购单列表
- `PurchaseTable` - 采购单表格
- `PurchaseForm` - 采购单表单
- `PurchaseDetail` - 采购单详情
- `StockInForm` - 入库表单
- `SupplierList` - 供应商列表
- `SupplierForm` - 供应商表单

---

### 3. 销售管理模块 (Sales Module)

**功能职责：**
- 订单管理
- 销售统计
- 退货管理
- 利润核算

**数据结构：**
```javascript
// 销售订单结构
{
  id: 'SO-20260304-001',
  orderNo: 'TM-20260304-001',
  platform: 'Temu',
  platformOrderId: '平台订单号',
  items: [
    {
      productId: 'SPU-001',
      skuId: 'SKU-001-W',
      quantity: 2,
      unitPrice: 19.99,
      totalAmount: 39.98
    }
  ],
  totalAmount: 39.98,
  profit: 15.98,
  status: '已完成',
  orderDate: '2026-03-04',
  shipDate: '2026-03-05'
}
```

**组件列表：**
- `SalesList` - 销售订单列表
- `SalesTable` - 销售订单表格
- `SalesDetail` - 订单详情
- `SalesStats` - 销售统计
- `ReturnList` - 退货列表

---

### 4. 文件管理模块 (Files Module)

**功能职责：**
- 商品图片管理
- 文档管理
- 文件夹管理
- 文件上传/下载

**组件列表：**
- `FileList` - 文件列表（列表视图）
- `FileGrid` - 文件网格（网格视图）
- `FileUpload` - 文件上传组件
- `FolderTree` - 文件夹树
- `FilePreview` - 文件预览

---

### 5. 数据报表模块 (Reports Module)

**功能职责：**
- 销售报表
- 利润报表
- 库存报表
- 采购报表

**组件列表：**
- `SalesReport` - 销售报表
- `ProfitReport` - 利润报表
- `StockReport` - 库存报表
- `PurchaseReport` - 采购报表
- `ChartCard` - 图表卡片

---

## 🔧 公共组件库

### 基础组件
- `StatCard` - 统计卡片
- `DataTable` - 数据表格
- `SearchBar` - 搜索栏
- `FilterBar` - 筛选栏
- `Pagination` - 分页器
- `Modal` - 弹窗
- `Form` - 表单
- `Button` - 按钮
- `Input` - 输入框
- `Select` - 选择器
- `DatePicker` - 日期选择器
- `Upload` - 上传组件
- `Badge` - 徽章
- `Tag` - 标签
- `Avatar` - 头像
- `Breadcrumb` - 面包屑
- `Tabs` - 标签页
- `Dropdown` - 下拉菜单

---

## 📊 状态管理 (Pinia)

### Product Store
```javascript
// stores/product.js
export const useProductStore = defineStore('product', {
  state: () => ({
    spus: [],
    currentSpu: null,
    filters: {
      keyword: '',
      platform: '',
      status: '',
      category: ''
    },
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0
    }
  }),
  getters: {
    filteredSpus: (state) => {
      // 筛选逻辑
    },
    totalStock: (state) => {
      // 计算总库存
    }
  },
  actions: {
    async fetchProducts() {},
    async addProduct() {},
    async updateProduct() {},
    async deleteProduct() {},
    async addSku() {},
    async updateSku() {},
    async deleteSku() {}
  }
})
```

---

## 🌐 API 接口层

### 商品 API
```javascript
// api/product.js
export const productApi = {
  // SPU
  getSpus: (params) => request.get('/products', { params }),
  getSpu: (id) => request.get(`/products/${id}`),
  createSpu: (data) => request.post('/products', data),
  updateSpu: (id, data) => request.put(`/products/${id}`, data),
  deleteSpu: (id) => request.delete(`/products/${id}`),
  
  // SKU
  getSkus: (spuId) => request.get(`/products/${spuId}/skus`),
  createSku: (spuId, data) => request.post(`/products/${spuId}/skus`, data),
  updateSku: (spuId, skuId, data) => request.put(`/products/${spuId}/skus/${skuId}`, data),
  deleteSku: (spuId, skuId) => request.delete(`/products/${spuId}/skus/${skuId}`),
  
  // 批量操作
  batchImport: (data) => request.post('/products/import', data),
  batchExport: (params) => request.get('/products/export', { params, responseType: 'blob' }),
  batchUpdate: (data) => request.put('/products/batch', data),
  batchDelete: (ids) => request.delete('/products/batch', { data: { ids } })
}
```

---

## 🎨 UI/UX 优化

### 1. 布局优化
- 响应式设计（桌面/平板/手机）
- 固定表头（表格滚动时表头固定）
- 虚拟滚动（大数据量表格性能优化）
- 懒加载（图片/数据懒加载）

### 2. 交互优化
- 快捷键支持（Ctrl+S 保存，Ctrl+F 搜索等）
- 批量操作（多选/全选/反选）
- 拖拽排序（表格列拖拽/文件拖拽上传）
- 右键菜单（表格行右键操作）

### 3. 视觉优化
- 加载状态（骨架屏/加载动画）
- 空状态（空数据提示）
- 错误状态（错误提示 + 重试）
- 成功提示（操作成功 Toast）

---

## 🚀 性能优化

### 1. 代码层面
- 组件懒加载
- 路由懒加载
- 图片懒加载
- 防抖节流

### 2. 数据层面
- 分页加载
- 虚拟列表
- 数据缓存
- 增量更新

### 3. 构建层面
- 代码分割
- Tree Shaking
- 压缩混淆
- CDN 加速

---

## 📋 开发计划

### Phase 1: 基础架构 (1-2 天)
- [ ] 项目结构重构
- [ ] 公共组件库搭建
- [ ] 状态管理配置
- [ ] API 接口封装

### Phase 2: 商品模块 (2-3 天)
- [ ] SPU 管理
- [ ] SKU 管理
- [ ] 批量导入导出
- [ ] 商品图片管理

### Phase 3: 采购模块 (2-3 天)
- [ ] 采购单管理
- [ ] 供应商管理
- [ ] 入库管理
- [ ] 采购统计

### Phase 4: 销售模块 (2-3 天)
- [ ] 订单管理
- [ ] 销售统计
- [ ] 利润核算
- [ ] 退货管理

### Phase 5: 报表模块 (2-3 天)
- [ ] 销售报表
- [ ] 利润报表
- [ ] 库存报表
- [ ] 图表可视化

### Phase 6: 优化测试 (1-2 天)
- [ ] 性能优化
- [ ] 单元测试
- [ ] 集成测试
- [ ] 文档编写

---

## 🔐 权限管理

### 角色定义
- **管理员** - 所有权限
- **运营** - 商品管理、销售管理
- **采购** - 采购管理、供应商管理
- **财务** - 报表查看、对账管理
- **客服** - 订单查看、退货处理

### 权限控制
- 路由权限（页面访问权限）
- 组件权限（按钮/操作权限）
- 数据权限（数据范围权限）

---

## 📝 现在开始实施重构！

我会按照这个方案重新设计系统，让它更加专业、模块化、易维护！
