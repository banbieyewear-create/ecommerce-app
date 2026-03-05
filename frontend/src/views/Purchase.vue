<template>
  <div class="purchase-page">
    <div class="content-wrapper">
      <!-- 页面头部 -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-title">
            <h1>📋 采购管理</h1>
            <p>管理采购订单、供应商和入库记录</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" @click="showRequestForm = true">
              <span class="icon">📝</span>
              <span class="text">采购申请</span>
            </button>
            <button class="btn btn-outline" @click="exportData">
              <span class="icon">📥</span>
              <span class="text">导出</span>
            </button>
            <button class="btn btn-primary" @click="showAddModal = true">
              <span class="icon">➕</span>
              <span class="text">新建采购单</span>
            </button>
          </div>
        </div>
      </header>

      <!-- 筛选工具栏 -->
      <section class="toolbar-section">
        <div class="toolbar-content">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              v-model="searchKeyword" 
              placeholder="搜索采购单号、供应商、商品..."
              class="search-input"
            />
          </div>
          <div class="filters">
            <div class="filter-item">
              <select v-model="filterStatus" class="filter-select">
                <option value="">全部状态</option>
                <option value="pending">待付款</option>
                <option value="paid">已付款</option>
                <option value="shipped">已发货</option>
                <option value="partial">部分入库</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
            <div class="filter-item">
              <select v-model="filterSupplier" class="filter-select">
                <option value="">全部供应商</option>
                <option v-for="supplier in uniqueSuppliers" :key="supplier" :value="supplier">{{ supplier }}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- 统计卡片区 -->
      <section class="stats-section">
        <StatCard 
          icon="⏳" 
          label="待付款" 
          :value="pendingCount" 
          color="yellow"
          class="stat-item"
        />
        <StatCard 
          icon="💸" 
          label="已付款" 
          :value="paidCount" 
          color="blue"
          class="stat-item"
        />
        <StatCard 
          icon="🚚" 
          label="已发货" 
          :value="shippedCount" 
          color="purple"
          class="stat-item"
        />
        <StatCard 
          icon="✅" 
          label="已完成" 
          :value="completedCount" 
          color="green"
          class="stat-item"
        />
      </section>

      <!-- 数据表格 -->
      <section class="table-section">
        <div class="table-wrapper">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 12%;">采购单号</th>
                  <th style="width: 15%;">供应商</th>
                  <th style="width: 28%;">商品信息</th>
                  <th style="width: 8%;">数量</th>
                  <th style="width: 12%;">金额</th>
                  <th style="width: 10%;">状态</th>
                  <th style="width: 10%;">采购日期</th>
                  <th style="width: 5%;">操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="order in paginatedOrders" :key="order.id">
                  <tr class="order-row">
                    <td>
                      <span class="order-code">{{ order.orderNo }}</span>
                    </td>
                    <td>
                      <div class="supplier-name">{{ order.supplierName }}</div>
                    </td>
                    <td>
                      <div class="product-list">
                        <div v-for="item in order.items" :key="item.id" class="product-item">
                          <span class="product-icon">📦</span>
                          <span class="product-partnumber">{{ item.partNumber || item.productId }}</span>
                          <span class="product-sku" v-if="item.sku">({{ item.sku }})</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="quantity">{{ order.totalQuantity }}</span>
                    </td>
                    <td>
                      <div class="amount">¥{{ order.totalAmount.toLocaleString() }}</div>
                    </td>
                    <td>
                      <span :class="['status-badge', 'status-' + order.status]">
                        {{ getStatusText(order.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="date-info">
                        <div class="date-main">{{ order.orderDate }}</div>
                        <div class="date-sub" v-if="order.expectedDate">预计：{{ order.expectedDate }}</div>
                      </div>
                    </td>
                    <td>
                      <div class="action-group">
                        <button class="btn-action-sm" @click="viewOrder(order)" title="查看">
                          <span>👁️</span>
                        </button>
                        <button class="btn-action-sm" @click="editOrder(order)" title="编辑">
                          <span>✏️</span>
                        </button>
                        <button class="btn-action-sm" @click="deleteOrder(order)" title="删除">
                          <span>🗑️</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
                <tr v-if="paginatedOrders.length === 0">
                  <td colspan="8" class="empty-state">
                    <div class="empty-content">
                      <span class="empty-icon">📋</span>
                      <p class="empty-text">暂无采购单</p>
                      <button class="btn btn-primary" @click="showAddModal = true" style="margin-top: 12px;">
                        <span>➕</span> 新建采购单
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-section" v-if="totalPages > 1">
          <div class="pagination-info">
            显示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredOrders.length) }} 条，共 {{ filteredOrders.length }} 条
          </div>
          <div class="pagination">
            <button 
              class="page-btn" 
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              上一页
            </button>
            <span class="page-num">{{ currentPage }} / {{ totalPages }}</span>
            <button 
              class="page-btn"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              下一页
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- 新建/编辑采购单模态框 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? '✏️ 编辑采购单' : '➕ 新建采购单' }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">供应商</label>
                <select v-model="form.supplierName" class="form-select">
                  <option value="">选择供应商</option>
                  <option v-for="supplier in uniqueSuppliers" :key="supplier" :value="supplier">{{ supplier }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">采购日期</label>
                <input type="date" v-model="form.orderDate" class="form-input" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">预计到货日期</label>
              <input type="date" v-model="form.expectedDate" class="form-input" />
            </div>
            
            <!-- 商品列表 -->
            <div class="form-group">
              <label class="form-label">采购商品</label>
              <div class="items-list">
                <div v-for="(item, index) in form.items" :key="index" class="item-row-edit">
                  <input 
                    type="text" 
                    v-model="item.searchText" 
                    class="form-input"
                    placeholder="主货号"
                    @input="onEditSearchInput(item, index)"
                    :class="{ 'has-results': item.showResults && item.searchResults.length > 0 }"
                    style="flex: 1.5;"
                  />
                  <select v-model="item.skuId" class="form-select" style="flex: 1.5;">
                    <option value="">规格</option>
                    <option v-for="sku in getProductSkus(item.productId)" :key="sku.id" :value="sku.id">
                      {{ sku.specs }}
                    </option>
                  </select>
                  <input type="number" v-model.number="item.quantity" placeholder="数量" class="form-input" style="width: 70px;" />
                  <input type="number" v-model.number="item.unitPrice" placeholder="单价" class="form-input" style="width: 80px;" step="0.01" readonly />
                  <div class="item-total">¥{{ (item.quantity * item.unitPrice).toLocaleString() }}</div>
                  <button class="btn-remove" @click="removeItem(index)" title="删除">✕</button>
                </div>
                <button class="btn-add-item" @click="addEditItem">+ 添加商品</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea v-model="form.remarks" class="form-textarea" placeholder="备注信息" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="total-info">
            <span>总计：¥{{ formTotalAmount.toLocaleString() }}</span>
            <span>总数量：{{ formTotalQuantity }}</span>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" @click="closeModal">取消</button>
            <button class="btn btn-primary" @click="saveOrder">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 查看采购单详情模态框 -->
    <div v-if="showViewModal" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal-container modal-large">
        <div class="modal-header">
          <h3 class="modal-title">📋 采购单详情</h3>
          <button class="modal-close" @click="closeViewModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="currentOrder" class="order-detail">
            <div class="detail-header">
              <div class="detail-row">
                <span class="detail-label">采购单号：</span>
                <span class="detail-value">{{ currentOrder.orderNo }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">供应商：</span>
                <span class="detail-value">{{ currentOrder.supplierName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">状态：</span>
                <span :class="['status-badge', 'status-' + currentOrder.status]">
                  {{ getStatusText(currentOrder.status) }}
                </span>
              </div>
            </div>
            <div class="detail-section">
              <h4 class="section-title">商品信息</h4>
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>主货号</th>
                    <th>规格</th>
                    <th>数量</th>
                    <th>单价</th>
                    <th>小计</th>
                    <th>已入库</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in currentOrder.items" :key="item.id">
                    <td>{{ item.partNumber || item.productId }}</td>
                    <td>{{ item.sku || item.specs || '-' }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>¥{{ item.unitPrice }}</td>
                    <td>¥{{ (item.quantity * item.unitPrice).toLocaleString() }}</td>
                    <td>{{ item.receivedQty || 0 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="detail-footer">
              <div class="detail-row">
                <span class="detail-label">采购日期：</span>
                <span class="detail-value">{{ currentOrder.orderDate }}</span>
              </div>
              <div class="detail-row" v-if="currentOrder.expectedDate">
                <span class="detail-label">预计到货：</span>
                <span class="detail-value">{{ currentOrder.expectedDate }}</span>
              </div>
              <div class="detail-row" v-if="currentOrder.actualDate">
                <span class="detail-label">实际到货：</span>
                <span class="detail-value">{{ currentOrder.actualDate }}</span>
              </div>
              <div class="detail-row total">
                <span class="detail-label">总金额：</span>
                <span class="detail-value amount">¥{{ currentOrder.totalAmount.toLocaleString() }}</span>
              </div>
            </div>
            <div class="detail-section" v-if="currentOrder.remarks">
              <h4 class="section-title">备注</h4>
              <p class="remarks-text">{{ currentOrder.remarks }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeViewModal">关闭</button>
          <button class="btn btn-primary" @click="stockInOrder" v-if="currentOrder && currentOrder.status !== 'completed'">
            📥 入库
          </button>
        </div>
      </div>
    </div>

    <!-- 入库模态框 -->
    <div v-if="showStockInModal" class="modal-overlay" @click.self="closeStockInModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">📥 采购入库</h3>
          <button class="modal-close" @click="closeStockInModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="stock-in-list">
            <div v-for="(item, index) in stockInItems" :key="index" class="stock-in-item">
              <div class="item-info">
                <span class="item-name">{{ item.productName }}</span>
                <span class="item-sku" v-if="item.sku">({{ item.sku }})</span>
              </div>
              <div class="item-qty">
                <span>采购：{{ item.quantity }}</span>
                <span>已入：{{ item.receivedQty || 0 }}</span>
              </div>
              <div class="item-input">
                <input 
                  type="number" 
                  v-model.number="item.inputQty" 
                  :max="item.quantity - (item.receivedQty || 0)"
                  :placeholder="`最多${item.quantity - (item.receivedQty || 0)}`"
                  class="form-input"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeStockInModal">取消</button>
          <button class="btn btn-primary" @click="confirmStockIn">确认入库</button>
        </div>
      </div>
    </div>

    <!-- 采购申请表单 -->
    <div v-if="showRequestForm" class="modal-overlay" @click.self="closeRequestForm">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">📝 采购申请</h3>
          <button class="modal-close" @click="closeRequestForm">✕</button>
        </div>
        <div class="modal-body">
          <div class="request-form">
            <div class="form-section">
              <!-- 申请商品列表 -->
              <div class="form-group">
                <label class="form-label">申请商品 <span class="required">*</span></label>
                <div class="items-list">
                  <div v-for="(item, index) in requestForm.items" :key="index" class="item-row-simple">
                    <div class="item-main">
                      <div class="search-wrapper">
                        <input 
                          type="text" 
                          v-model="item.searchText" 
                          class="form-input"
                          placeholder="输入主货号搜索..."
                          @input="onSearchInput(item, index)"
                          :class="{ 'has-results': item.showResults && item.searchResults.length > 0 }"
                        />
                        <div v-if="item.showResults && item.searchResults.length > 0" class="search-results">
                          <div 
                            v-for="product in item.searchResults" 
                            :key="product.id" 
                            class="search-result-item"
                            @click="selectProduct(item, index, product)"
                          >
                            <span class="result-partnumber">{{ product.mainPartNumber || product.id }}</span>
                            <span class="result-name">{{ product.name }}</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 规格列表（多选） -->
                      <div v-if="item.productId && item.skus && item.skus.length > 0" class="sku-list">
                        <div class="sku-list-header">
                          <span class="detail-tag">型号：{{ item.partNumber }}</span>
                          <span class="sku-count">共 {{ item.skus.length }} 个规格</span>
                        </div>
                        <div class="sku-items">
                          <div v-for="sku in item.skus" :key="sku.id" class="sku-item">
                            <span class="sku-specs">{{ sku.specs }}</span>
                            <div class="sku-qty">
                              <span class="sku-price">¥{{ sku.cost }}</span>
                              <input 
                                type="number" 
                                v-model.number="sku.quantity" 
                                placeholder="数量"
                                class="form-input sku-qty-input"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="item-actions-right">
                      <button class="btn-remove" @click="removeRequestItem(index)" title="删除">✕</button>
                    </div>
                  </div>
                  <button class="btn-add-item" @click="addRequestItem">+ 添加商品</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="total-info">
            <span>总数量：{{ requestFormTotalQuantity }}</span>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" @click="closeRequestForm">取消</button>
            <button class="btn btn-primary" @click="submitRequest">提交</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StatCard from '../components/common/StatCard.vue'

export default {
  name: 'PurchasePage',
  components: {
    StatCard
  },
  data() {
    return {
      searchKeyword: '',
      filterStatus: '',
      filterSupplier: '',
      showAddModal: false,
      showEditModal: false,
      showViewModal: false,
      showStockInModal: false,
      showRequestForm: false,
      isEdit: false,
      currentOrder: null,
      currentPage: 1,
      pageSize: 20,
      products: [],
      orders: [],
      requestForm: {
        items: []
      },
      form: {
        id: null,
        orderNo: '',
        supplierName: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDate: '',
        items: [],
        totalQuantity: 0,
        totalAmount: 0,
        status: 'pending',
        remarks: ''
      },
      stockInItems: []
    }
  },
  mounted() {
    this.loadProducts()
    this.loadOrders()
    window.addEventListener('products-updated', this.loadProducts)
    window.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    window.removeEventListener('products-updated', this.loadProducts)
    window.removeEventListener('click', this.handleClickOutside)
  },
  computed: {
    uniqueSuppliers() {
      const suppliers = new Set(this.orders.map(o => o.supplierName))
      return Array.from(suppliers)
    },
    filteredOrders() {
      return this.orders.filter(order => {
        const matchSearch = !this.searchKeyword || 
          order.orderNo.includes(this.searchKeyword) || 
          order.supplierName.includes(this.searchKeyword) ||
          order.items.some(item => item.productName.includes(this.searchKeyword))
        const matchStatus = !this.filterStatus || order.status === this.filterStatus
        const matchSupplier = !this.filterSupplier || order.supplierName === this.filterSupplier
        return matchSearch && matchStatus && matchSupplier
      }).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    },
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredOrders.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.pageSize)
    },
    pendingCount() {
      return this.orders.filter(o => o.status === 'pending').length
    },
    paidCount() {
      return this.orders.filter(o => o.status === 'paid').length
    },
    shippedCount() {
      return this.orders.filter(o => o.status === 'shipped').length
    },
    completedCount() {
      return this.orders.filter(o => o.status === 'completed').length
    },
    formTotalQuantity() {
      return this.form.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    },
    formTotalAmount() {
      return this.form.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0)
    },
    requestFormTotalQuantity() {
      return this.requestForm.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    },
    requestFormTotalAmount() {
      return this.requestForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0)
    }
  },
  methods: {
    loadProducts() {
      const products = localStorage.getItem('ecommerce-products')
      if (products) {
        try {
          this.products = JSON.parse(products)
        } catch (e) {
          console.error('加载产品数据失败:', e)
          this.products = []
        }
      }
    },
    loadOrders() {
      const orders = localStorage.getItem('ecommerce-purchase-orders')
      if (orders) {
        try {
          this.orders = JSON.parse(orders)
        } catch (e) {
          console.error('加载采购单失败:', e)
          this.orders = []
        }
      }
    },
    saveOrders() {
      localStorage.setItem('ecommerce-purchase-orders', JSON.stringify(this.orders))
    },
    getProductSkus(productId) {
      const product = this.products.find(p => p.id === productId)
      return product ? product.skus : []
    },
    onProductChange(item, index) {
      const product = this.products.find(p => p.id === item.productId)
      if (product) {
        item.productName = product.name
        item.sku = ''
        item.skuId = ''
        item.unitPrice = product.skus.length > 0 ? product.skus[0].cost : 0
      }
    },
    onRequestProductChange(item, index) {
      const product = this.products.find(p => p.id === item.productId)
      if (product) {
        item.productName = product.name
        item.partNumber = product.mainPartNumber || ''
        item.supplierName = product.shopName || ''
        item.sku = ''
        item.skuId = ''
        item.unitPrice = product.skus.length > 0 ? product.skus[0].cost : 0
        item.specs = ''
      }
    },
    onRequestSkuChange(item, index) {
      const product = this.products.find(p => p.id === item.productId)
      if (product && item.skuId) {
        const sku = product.skus.find(s => s.id === item.skuId)
        if (sku) {
          item.specs = sku.specs
          item.unitPrice = sku.cost
        }
      }
    },
    getProductPartNumber(productId) {
      const product = this.products.find(p => p.id === productId)
      return product ? (product.mainPartNumber || '-') : '-'
    },
    handleClickOutside(event) {
      // 点击外部关闭搜索结果
      if (!event.target.closest('.search-wrapper')) {
        this.requestForm.items.forEach(item => {
          item.showResults = false
        })
      }
    },
    addRequestItem() {
      this.requestForm.items.push({
        searchText: '',
        productId: '',
        productName: '',
        partNumber: '',
        supplierName: '',
        skus: [],
        searchResults: [],
        showResults: false
      })
    },
    onSearchInput(item, index) {
      const searchText = item.searchText.trim()
      if (!searchText) {
        item.searchResults = []
        item.showResults = false
        return
      }
      
      // 模糊匹配主货号
      item.searchResults = this.products
        .filter(p => {
          const pn = (p.mainPartNumber || '').toLowerCase()
          const name = (p.name || '').toLowerCase()
          const search = searchText.toLowerCase()
          return pn.includes(search) || name.includes(search)
        })
        .slice(0, 10) // 最多显示 10 条
      
      item.showResults = true
    },
    selectProduct(item, index, product) {
      item.productId = product.id
      item.productName = product.name
      item.partNumber = product.mainPartNumber || ''
      item.supplierName = product.shopName || ''
      item.searchText = product.mainPartNumber || product.id
      item.showResults = false
      item.searchResults = []
      
      // 加载所有规格，每个规格添加 quantity 字段
      item.skus = product.skus.map(sku => ({
        id: sku.id,
        specs: sku.specs,
        cost: sku.cost,
        quantity: 0 // 初始数量为 0
      }))
    },
    removeRequestItem(index) {
      this.requestForm.items.splice(index, 1)
    },
    submitRequest() {
      if (this.requestForm.items.length === 0 || this.requestForm.items.every(i => !i.productId)) {
        alert('请至少添加一个商品')
        return
      }

      // 收集所有有数量的规格
      const allItems = []
      this.requestForm.items.forEach(item => {
        if (item.productId && item.skus) {
          item.skus.forEach(sku => {
            if (sku.quantity > 0) {
              allItems.push({
                productId: item.productId,
                skuId: sku.id,
                productName: item.productName,
                partNumber: item.partNumber,
                sku: sku.specs,
                specs: sku.specs,
                quantity: sku.quantity,
                unitPrice: sku.cost,
                receivedQty: 0
              })
            }
          })
        }
      })

      if (allItems.length === 0) {
        alert('请至少为一个规格填写数量')
        return
      }

      const firstProduct = this.products.find(p => p.id === allItems[0].productId)
      const autoSupplier = firstProduct ? firstProduct.shopName : '未知供应商'

      const totalQuantity = allItems.reduce((sum, i) => sum + i.quantity, 0)
      const totalAmount = allItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0)

      const requestOrder = {
        id: 'PR-' + Date.now(),
        orderNo: 'PR-' + new Date().toISOString().split('T')[0].replace(/-/g, '') + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        type: 'request',
        supplierName: autoSupplier,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDate: new Date().toISOString().split('T')[0],
        items: allItems,
        totalQuantity: totalQuantity,
        totalAmount: totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      this.orders.push(requestOrder)
      this.saveOrders()

      alert('✅ 采购申请已提交！\n单号：' + requestOrder.orderNo + '\n总数量：' + totalQuantity + '\n总金额：¥' + totalAmount.toLocaleString())
      this.closeRequestForm()
    },
    closeRequestForm() {
      this.showRequestForm = false
      this.requestForm = {
        items: []
      }
    },
    addEditItem() {
      this.form.items.push({
        searchText: '',
        productId: '',
        skuId: '',
        productName: '',
        partNumber: '',
        sku: '',
        quantity: 1,
        unitPrice: 0,
        searchResults: [],
        showResults: false
      })
    },
    removeItem(index) {
      this.form.items.splice(index, 1)
    },
    onEditSearchInput(item, index) {
      const searchText = item.searchText.trim()
      if (!searchText) {
        item.searchResults = []
        item.showResults = false
        return
      }
      
      item.searchResults = this.products
        .filter(p => {
          const pn = (p.mainPartNumber || '').toLowerCase()
          const name = (p.name || '').toLowerCase()
          const search = searchText.toLowerCase()
          return pn.includes(search) || name.includes(search)
        })
        .slice(0, 10)
      
      item.showResults = true
    },
    selectEditProduct(item, index, product) {
      item.productId = product.id
      item.productName = product.name
      item.partNumber = product.mainPartNumber || ''
      item.searchText = product.mainPartNumber || product.id
      item.showResults = false
      item.searchResults = []
      
      if (product.skus && product.skus.length > 0) {
        const firstSku = product.skus[0]
        item.skuId = firstSku.id
        item.sku = firstSku.specs
        item.unitPrice = firstSku.cost
      }
    },
    generateOrderNo() {
      const date = new Date()
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      return `PO-${dateStr}-${random}`
    },
    saveOrder() {
      if (!this.form.supplierName) {
        alert('请选择供应商')
        return
      }
      if (this.form.items.length === 0 || this.form.items.every(i => !i.productId)) {
        alert('请至少添加一个商品')
        return
      }
      
      const validItems = this.form.items.filter(i => i.productId && i.quantity > 0)
      if (validItems.length === 0) {
        alert('请至少添加一个有效商品')
        return
      }

      const orderData = {
        ...this.form,
        items: validItems,
        totalQuantity: this.formTotalQuantity,
        totalAmount: this.formTotalAmount
      }

      if (this.isEdit && this.currentOrder) {
        // 编辑
        const index = this.orders.findIndex(o => o.id === this.currentOrder.id)
        if (index > -1) {
          this.orders.splice(index, 1, orderData)
        }
      } else {
        // 新建
        orderData.id = 'PO-' + Date.now()
        orderData.orderNo = this.generateOrderNo()
        orderData.status = 'pending'
        orderData.createdAt = new Date().toISOString()
        this.orders.push(orderData)
      }

      this.saveOrders()
      alert('✅ 采购单已保存！')
      this.closeModal()
    },
    viewOrder(order) {
      this.currentOrder = order
      this.showViewModal = true
    },
    editOrder(order) {
      this.currentOrder = order
      this.isEdit = true
      
      // 构建商品项，确保主货号正确显示
      const editItems = order.items.map(i => {
        // 尝试从商品数据中查找主货号
        const product = this.products.find(p => p.id === i.productId)
        const partNumber = i.partNumber || (product ? product.mainPartNumber : '')
        
        return {
          searchText: partNumber || i.productId || '',
          productId: i.productId,
          skuId: i.skuId,
          productName: i.productName || (product ? product.name : ''),
          partNumber: partNumber,
          sku: i.sku || i.specs,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          searchResults: [],
          showResults: false
        }
      })
      
      this.form = {
        id: order.id,
        orderNo: order.orderNo,
        supplierName: order.supplierName,
        orderDate: order.orderDate,
        expectedDate: order.expectedDate || '',
        items: editItems,
        totalQuantity: order.totalQuantity,
        totalAmount: order.totalAmount,
        status: order.status,
        remarks: order.remarks || ''
      }
      this.showEditModal = true
    },
    deleteOrder(order) {
      if (confirm(`确定删除采购单 "${order.orderNo}" 吗？`)) {
        const index = this.orders.findIndex(o => o.id === order.id)
        if (index > -1) {
          this.orders.splice(index, 1)
          this.saveOrders()
          alert('✅ 采购单已删除')
        }
      }
    },
    stockInOrder() {
      this.stockInItems = this.currentOrder.items.map(item => ({
        ...item,
        inputQty: null
      }))
      this.showStockInModal = true
    },
    confirmStockIn() {
      const validItems = this.stockInItems.filter(i => i.inputQty > 0)
      if (validItems.length === 0) {
        alert('请输入入库数量')
        return
      }

      // 更新采购单状态
      const orderIndex = this.orders.findIndex(o => o.id === this.currentOrder.id)
      if (orderIndex > -1) {
        const order = this.orders[orderIndex]
        
        // 更新入库数量
        validItems.forEach(inputItem => {
          const itemIndex = order.items.findIndex(i => i.id === inputItem.id)
          if (itemIndex > -1) {
            order.items[itemIndex].receivedQty = (order.items[itemIndex].receivedQty || 0) + inputItem.inputQty
          }
        })

        // 检查是否全部入库
        const allReceived = order.items.every(i => (i.receivedQty || 0) >= i.quantity)
        if (allReceived) {
          order.status = 'completed'
          order.actualDate = new Date().toISOString().split('T')[0]
        } else {
          order.status = 'partial'
        }

        this.orders.splice(orderIndex, 1, order)
        this.saveOrders()
        
        alert('✅ 入库完成！')
        this.closeStockInModal()
        this.showViewModal = false
      }
    },
    closeModal() {
      this.showAddModal = false
      this.showEditModal = false
      this.isEdit = false
      this.currentOrder = null
      this.form = {
        id: null,
        orderNo: '',
        supplierName: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDate: '',
        items: [],
        totalQuantity: 0,
        totalAmount: 0,
        status: 'pending',
        remarks: ''
      }
    },
    closeViewModal() {
      this.showViewModal = false
      this.currentOrder = null
    },
    closeStockInModal() {
      this.showStockInModal = false
      this.stockInItems = []
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    getStatusText(status) {
      const map = {
        'pending': '待付款',
        'paid': '已付款',
        'shipped': '已发货',
        'partial': '部分入库',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return map[status] || status
    },
    exportData() {
      alert('导出功能开发中...')
    }
  }
}
</script>

<style scoped>
/* 使用与商品管理页面相同的样式变量 */
.purchase-page {
  width: 100%;
  min-height: 100%;
  padding: 0;
  background: #0f172a;
  box-sizing: border-box;
}

.content-wrapper {
  width: 100%;
  max-width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.08), rgba(59, 130, 246, 0.08));
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #1e293b;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.header-title h1 {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 6px 0;
}

.header-title p {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn .icon {
  font-size: 18px;
}

.btn-outline {
  background: #1e293b;
  color: #f8fafc;
  border: 2px solid #334155;
}

.btn-outline:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

/* 筛选栏 */
.toolbar-section {
  background: #1e293b;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #334155;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f8fafc;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.filters {
  display: flex;
  gap: 10px;
}

.filter-item .filter-select {
  padding: 10px 16px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f8fafc;
  font-size: 14px;
  cursor: pointer;
}

.filter-item .filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  min-width: 180px;
}

@media (max-width: 1200px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
}

/* 表格 */
.table-section {
  background: #1e293b;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #334155;
  width: 100%;
  box-sizing: border-box;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  color: #f8fafc;
  table-layout: fixed;
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  border-bottom: 2px solid #334155;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #334155;
}

.data-table tbody tr:hover {
  background: #334155;
}

.order-code {
  font-weight: 600;
  color: #60a5fa;
}

.supplier-name {
  font-weight: 500;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.product-icon {
  font-size: 14px;
}

.product-partnumber {
  font-weight: 600;
  color: #60a5fa;
}

.product-sku {
  color: #94a3b8;
  font-size: 12px;
}

.quantity {
  font-weight: 500;
}

.amount {
  font-weight: 600;
  color: #4ade80;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.status-paid {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.status-shipped {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.status-partial {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-completed {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-cancelled {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
}

.date-main {
  font-weight: 500;
}

.date-sub {
  color: #94a3b8;
  font-size: 12px;
}

.action-group {
  display: flex;
  gap: 6px;
}

.btn-action-sm {
  padding: 6px 10px;
  background: #334155;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-action-sm:hover {
  background: #475569;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 16px;
  margin: 0 0 12px 0;
}

/* 分页 */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #334155;
}

.pagination-info {
  font-size: 13px;
  color: #94a3b8;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-btn {
  padding: 8px 16px;
  background: #334155;
  border: none;
  border-radius: 8px;
  color: #f8fafc;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #475569;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-num {
  font-size: 14px;
  color: #f8fafc;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: #1e293b;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #334155;
}

.modal-large {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #334155;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #334155;
  color: #f8fafc;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #334155;
  gap: 16px;
}

.total-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #94a3b8;
}

.total-info span:last-child {
  font-weight: 600;
  color: #f8fafc;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

/* 表单 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
}

.form-input,
.form-select,
.form-textarea {
  padding: 10px 14px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f8fafc;
  font-size: 14px;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* 商品列表 */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-row-edit {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
}

.item-row-edit .form-input.has-results {
  border-color: #3b82f6;
}

.item-total {
  font-weight: 600;
  color: #4ade80;
  min-width: 80px;
  text-align: right;
}

.btn-remove {
  padding: 6px 10px;
  background: #ef4444;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.btn-add-item {
  padding: 10px;
  background: #334155;
  border: 1px dashed #475569;
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-add-item:hover {
  background: #475569;
  color: #f8fafc;
}

/* 订单详情 */
.order-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
  background: #0f172a;
  border-radius: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  color: #94a3b8;
  font-size: 13px;
}

.detail-value {
  font-weight: 500;
  color: #f8fafc;
}

.detail-value.amount {
  font-size: 18px;
  color: #4ade80;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.detail-table th,
.detail-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #334155;
}

.detail-table th {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
}

.detail-table td {
  font-size: 14px;
}

.detail-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #0f172a;
  border-radius: 12px;
}

.detail-footer .detail-row.total {
  border-top: 1px solid #334155;
  padding-top: 12px;
  margin-top: 8px;
}

.remarks-text {
  margin: 0;
  padding: 12px;
  background: #0f172a;
  border-radius: 8px;
  color: #f8fafc;
  line-height: 1.6;
}

/* 入库 */
.stock-in-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stock-in-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  align-items: center;
  padding: 12px;
  background: #0f172a;
  border-radius: 8px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 500;
}

.item-sku {
  font-size: 12px;
  color: #94a3b8;
}

.item-qty {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #94a3b8;
}

.item-input .form-input {
  width: 100%;
}

/* 采购申请表单 */
.request-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-row-simple {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  padding: 12px;
  background: #0f172a;
  border-radius: 8px;
  margin-bottom: 10px;
  position: relative;
}

.item-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-wrapper .form-input {
  width: 100%;
}

.search-wrapper .form-input.has-results {
  border-color: #3b82f6;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1e293b;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.search-result-item {
  padding: 10px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: #334155;
}

.search-result-item:first-child {
  border-radius: 8px 8px 0 0;
}

.search-result-item:last-child {
  border-radius: 0 0 8px 8px;
}

.result-partnumber {
  font-weight: 600;
  color: #60a5fa;
  font-size: 14px;
}

.result-name {
  font-size: 12px;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-details {
  display: flex;
  gap: 10px;
  align-items: center;
}

.detail-tag {
  padding: 6px 12px;
  background: #334155;
  border-radius: 6px;
  font-size: 13px;
  color: #94a3b8;
  white-space: nowrap;
}

.item-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.item-supplier {
  flex: 1;
}

.supplier-tag {
  font-size: 13px;
  color: #60a5fa;
}

.modal-large .form-section {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
}

/* 自定义滚动条 */
.form-section::-webkit-scrollbar {
  width: 6px;
}

.form-section::-webkit-scrollbar-track {
  background: #0f172a;
  border-radius: 3px;
}

.form-section::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

.form-section::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* 规格列表 */
.sku-list {
  margin-top: 12px;
  background: #1e293b;
  border-radius: 8px;
  padding: 12px;
  grid-column: 1 / -1;
}

.sku-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.sku-count {
  font-size: 12px;
  color: #94a3b8;
}

.sku-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.sku-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #0f172a;
  border-radius: 6px;
  gap: 12px;
}

.sku-specs {
  flex: 1;
  font-size: 14px;
  color: #f8fafc;
  font-weight: 500;
}

.sku-qty {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sku-price {
  font-size: 13px;
  color: #4ade80;
  font-weight: 600;
  min-width: 60px;
  text-align: right;
}

.sku-qty-input {
  width: 70px !important;
  padding: 6px 8px !important;
  font-size: 14px !important;
}

/* 编辑页面搜索结果 */
.item-row-edit .search-results {
  position: absolute;
  top: 100%;
  left: 0;
  background: #1e293b;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 200px;
}
</style>
