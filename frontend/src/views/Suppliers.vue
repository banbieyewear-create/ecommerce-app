<template>
  <div class="suppliers-page">
    <div class="content-wrapper">
      <!-- 页面头部 -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-title">
            <h1>🏭 供应商管理</h1>
            <p>管理供应商信息和采购记录</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" @click="showAddModal = true">
              <span class="icon">➕</span>
              <span class="text">添加供应商</span>
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
              placeholder="搜索供应商名称、商品..."
              class="search-input"
            />
          </div>
        </div>
      </section>

      <!-- 统计卡片区 -->
      <section class="stats-section">
        <StatCard 
          icon="🏭" 
          label="供应商总数" 
          :value="suppliers.length" 
          color="blue"
          class="stat-item"
        />
        <StatCard 
          icon="📦" 
          label="供应商品数" 
          :value="totalProducts" 
          color="green"
          class="stat-item"
        />
        <StatCard 
          icon="💰" 
          label="采购总额" 
          :value="totalPurchaseAmount" 
          color="purple"
          class="stat-item"
        />
      </section>

      <!-- 供应商列表 -->
      <section class="table-section">
        <div class="supplier-grid">
          <div v-for="supplier in filteredSuppliers" :key="supplier.id" class="supplier-card">
            <div class="supplier-header">
              <div class="supplier-name">{{ supplier.name }}</div>
              <div class="supplier-actions">
                <button class="btn-icon" @click="editSupplier(supplier)" title="编辑">✏️</button>
                <button class="btn-icon" @click="deleteSupplier(supplier)" title="删除">🗑️</button>
              </div>
            </div>
            <div class="supplier-body">
              <div class="supplier-info">
                <div class="info-row">
                  <span class="info-label">📦 商品数:</span>
                  <span class="info-value">{{ supplier.productCount || 0 }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">💰 采购额:</span>
                  <span class="info-value">¥{{ (supplier.totalAmount || 0).toLocaleString() }}</span>
                </div>
              </div>
              <div class="supplier-products" v-if="supplier.products && supplier.products.length > 0">
                <div class="products-title">供应商品：</div>
                <div class="products-tags">
                  <span v-for="product in supplier.products.slice(0, 5)" :key="product" class="product-tag">
                    {{ product }}
                  </span>
                  <span v-if="supplier.products.length > 5" class="product-tag more">
                    +{{ supplier.products.length - 5 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="filteredSuppliers.length === 0" class="empty-state">
          <span class="empty-icon">🏭</span>
          <p class="empty-text">暂无供应商</p>
          <button class="btn btn-primary" @click="showAddModal = true" style="margin-top: 12px;">
            <span>➕</span> 添加供应商
          </button>
        </div>
      </section>
    </div>

    <!-- 添加/编辑供应商模态框 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container modal-large">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? '✏️ 编辑供应商' : '➕ 添加供应商' }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">供应商名称 <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.name" 
                  class="form-input"
                  placeholder="请输入供应商名称"
                />
              </div>
              <div class="form-group">
                <label class="form-label">联系人</label>
                <input 
                  type="text" 
                  v-model="form.contact" 
                  class="form-input"
                  placeholder="联系人姓名"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">联系电话</label>
                <input 
                  type="tel" 
                  v-model="form.phone" 
                  class="form-input"
                  placeholder="联系电话"
                />
              </div>
              <div class="form-group">
                <label class="form-label">备注</label>
                <input 
                  type="text" 
                  v-model="form.remarks" 
                  class="form-input"
                  placeholder="备注"
                />
              </div>
            </div>
            
            <!-- 关联商品 -->
            <div class="form-group">
              <label class="form-label">关联商品</label>
              <div class="product-selector">
                <div class="search-box">
                  <input 
                    type="text" 
                    v-model="productSearch" 
                    class="form-input"
                    placeholder="搜索主货号或商品名称..."
                    @input="onProductSearch"
                  />
                  <div v-if="showProductResults && productSearchResults.length > 0" class="product-search-results">
                    <div 
                      v-for="product in productSearchResults" 
                      :key="product.id" 
                      class="product-result-item"
                      @click="addProductToSupplier(product)"
                    >
                      <span class="result-partnumber">{{ product.mainPartNumber || product.id }}</span>
                      <span class="result-name">{{ product.name }}</span>
                    </div>
                  </div>
                </div>
                <div class="selected-products" v-if="validProducts.length > 0">
                  <div v-for="(product, index) in validProducts" :key="index" class="selected-product">
                    <span class="product-name">{{ product.clean }}</span>
                    <button class="btn-remove-product" @click="removeProductByClean(product.original)" title="删除">✕</button>
                  </div>
                </div>
                <div v-else class="empty-products">
                  <span class="empty-text">暂无关联商品，请搜索添加</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveSupplier">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StatCard from '../components/common/StatCard.vue'

export default {
  name: 'SuppliersPage',
  components: {
    StatCard
  },
  data() {
    return {
      searchKeyword: '',
      showAddModal: false,
      showEditModal: false,
      isEdit: false,
      suppliers: [],
      products: [],
      purchaseOrders: [],
      form: {
        id: null,
        name: '',
        contact: '',
        phone: '',
        remarks: '',
        products: []
      },
      productSearch: '',
      productSearchResults: [],
      showProductResults: false
    }
  },
  created() {
    // 先加载供应商，再加载商品（避免分析时覆盖手动添加的供应商）
    this.loadSuppliers()
    this.loadProducts()
    this.loadPurchaseOrders()
  },
  mounted() {
    window.addEventListener('products-updated', this.loadProducts)
  },
  beforeDestroy() {
    window.removeEventListener('products-updated', this.loadProducts)
  },
  computed: {
    totalProducts() {
      return this.suppliers.reduce((sum, s) => sum + (s.productCount || 0), 0)
    },
    totalPurchaseAmount() {
      return this.suppliers.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
    },
    validProducts() {
      // 过滤并清理当前编辑供应商的商品列表
      if (!this.form.products) return []
      return this.form.products
        .map(p => ({
          original: p,
          clean: this.cleanPartNumber(p)
        }))
        .filter(p => p.clean && this.isValidPartNumber(p.original))
    },
    filteredSuppliers() {
      if (!this.searchKeyword) return this.suppliers
      
      const keyword = this.searchKeyword.toLowerCase()
      return this.suppliers.filter(s => {
        const matchName = s.name.toLowerCase().includes(keyword)
        const matchProducts = s.products && s.products.some(p => p.toLowerCase().includes(keyword))
        return matchName || matchProducts
      })
    }
  },
  methods: {
    loadProducts() {
      const products = localStorage.getItem('ecommerce-products')
      if (products) {
        try {
          this.products = JSON.parse(products)
          this.analyzeSupplierProducts()
        } catch (e) {
          console.error('加载产品数据失败:', e)
          this.products = []
        }
      }
    },
    loadSuppliers() {
      const suppliers = localStorage.getItem('ecommerce-suppliers')
      if (suppliers) {
        try {
          this.suppliers = JSON.parse(suppliers)
        } catch (e) {
          console.error('加载供应商失败:', e)
          this.suppliers = []
        }
      }
    },
    loadPurchaseOrders() {
      const orders = localStorage.getItem('ecommerce-purchase-orders')
      if (orders) {
        try {
          this.purchaseOrders = JSON.parse(orders)
          this.analyzeSupplierPurchases()
        } catch (e) {
          console.error('加载采购单失败:', e)
          this.purchaseOrders = []
        }
      }
    },
    analyzeSupplierProducts() {
      // 从商品数据中分析供应商
      const supplierMap = new Map()
      
      this.products.forEach(product => {
        const supplierName = product.shopName || '未知供应商'
        if (!supplierMap.has(supplierName)) {
          supplierMap.set(supplierName, {
            name: supplierName,
            products: [],
            productCount: 0
          })
        }
        const supplier = supplierMap.get(supplierName)
        const partNumber = product.mainPartNumber || product.id
        if (!supplier.products.includes(partNumber)) {
          supplier.products.push(partNumber)
          supplier.productCount++
        }
      })
      
      // 合并现有供应商数据（保留手动添加的供应商）
      const newSuppliers = Array.from(supplierMap.values())
      
      this.suppliers.forEach(existing => {
        // 检查是否是手动添加的供应商（不在商品数据中）
        const found = newSuppliers.find(s => s.name === existing.name)
        if (!found) {
          // 手动添加的供应商，保留
          newSuppliers.push(existing)
        } else {
          // 自动分析的供应商，保留手动编辑的信息
          found.id = existing.id
          found.contact = existing.contact
          found.phone = existing.phone
          found.remarks = existing.remarks
          found.totalAmount = existing.totalAmount || 0
          // 合并手动添加的商品
          if (existing.products) {
            existing.products.forEach(p => {
              if (!found.products.includes(p)) {
                found.products.push(p)
                found.productCount++
              }
            })
          }
        }
      })
      
      this.suppliers = newSuppliers
      this.saveSuppliers()
    },
    analyzeSupplierPurchases() {
      // 从采购单中分析供应商采购金额
      this.suppliers.forEach(supplier => {
        const supplierOrders = this.purchaseOrders.filter(o => o.supplierName === supplier.name)
        supplier.totalAmount = supplierOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      })
    },
    saveSuppliers() {
      localStorage.setItem('ecommerce-suppliers', JSON.stringify(this.suppliers))
    },
    addSupplier() {
      this.isEdit = false
      this.form = {
        id: null,
        name: '',
        contact: '',
        phone: '',
        remarks: ''
      }
      this.showAddModal = true
    },
    editSupplier(supplier) {
      this.isEdit = true
      this.form = {
        id: supplier.id,
        name: supplier.name,
        contact: supplier.contact || '',
        phone: supplier.phone || '',
        remarks: supplier.remarks || '',
        products: supplier.products ? [...supplier.products] : []
      }
      this.showEditModal = true
    },
    saveSupplier() {
      if (!this.form.name) {
        alert('请填写供应商名称')
        return
      }
      
      if (this.isEdit) {
        // 编辑
        const index = this.suppliers.findIndex(s => s.id === this.form.id)
        if (index > -1) {
          this.suppliers.splice(index, 1, {
            ...this.suppliers[index],
            name: this.form.name,
            contact: this.form.contact,
            phone: this.form.phone,
            remarks: this.form.remarks,
            products: this.form.products || [],
            productCount: (this.form.products || []).length
          })
        }
      } else {
        // 新建
        const newSupplier = {
          id: 'SUP-' + Date.now(),
          name: this.form.name,
          contact: this.form.contact,
          phone: this.form.phone,
          remarks: this.form.remarks,
          products: this.form.products || [],
          productCount: (this.form.products || []).length,
          totalAmount: 0
        }
        this.suppliers.push(newSupplier)
      }
      
      this.saveSuppliers()
      alert('✅ 供应商已保存！')
      this.closeModal()
    },
    deleteSupplier(supplier) {
      if (confirm(`确定删除供应商 "${supplier.name}" 吗？`)) {
        const index = this.suppliers.findIndex(s => s.id === supplier.id)
        if (index > -1) {
          this.suppliers.splice(index, 1)
          this.saveSuppliers()
          alert('✅ 供应商已删除')
        }
      }
    },
    closeModal() {
      this.showAddModal = false
      this.showEditModal = false
      this.isEdit = false
      this.form = {
        id: null,
        name: '',
        contact: '',
        phone: '',
        remarks: '',
        products: []
      }
      this.productSearch = ''
      this.productSearchResults = []
      this.showProductResults = false
    },
    onProductSearch() {
      const search = this.productSearch.trim().toLowerCase()
      if (!search) {
        this.productSearchResults = []
        this.showProductResults = false
        return
      }
      
      // 过滤掉已选择的商品
      const selectedParts = new Set(this.form.products)
      
      this.productSearchResults = this.products
        .filter(p => {
          const pn = (p.mainPartNumber || '').toLowerCase()
          const name = (p.name || '').toLowerCase()
          return (pn.includes(search) || name.includes(search)) && !selectedParts.has(p.mainPartNumber)
        })
        .slice(0, 10)
      
      this.showProductResults = true
    },
    addProductToSupplier(product) {
      if (!this.form.products) {
        this.form.products = []
      }
      const partNumber = product.mainPartNumber || product.id
      if (!this.form.products.includes(partNumber)) {
        this.form.products.push(partNumber)
      }
      this.productSearch = ''
      this.productSearchResults = []
      this.showProductResults = false
    },
    removeProductByClean(originalPartNumber) {
      if (this.form.products) {
        const index = this.form.products.findIndex(p => p === originalPartNumber)
        if (index > -1) {
          this.form.products.splice(index, 1)
        }
      }
    },
    cleanPartNumber(partNumber) {
      if (!partNumber) return ''
      // 移除 -51810 等后缀
      let cleaned = partNumber.replace(/-\d{4,}$/, '')
      // 过滤掉无效的前缀
      if (cleaned.startsWith('SPU-UNKNOWN') || cleaned.startsWith('SPU-') || cleaned === 'PPE') {
        return ''
      }
      return cleaned
    },
    isValidPartNumber(partNumber) {
      if (!partNumber) return false
      // 过滤掉无效的主货号
      if (partNumber.startsWith('SPU-UNKNOWN') || partNumber.startsWith('SPU-')) {
        return false
      }
      if (partNumber === 'PPE' || partNumber === 'UNKNOWN') {
        return false
      }
      return true
    }
  }
}
</script>

<style scoped>
.suppliers-page {
  width: 100%;
  min-height: 100vh;
  padding: 0;
  background: #0f172a;
  box-sizing: border-box;
  overflow-x: hidden;
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

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  min-width: 180px;
}

/* 供应商网格 */
.table-section {
  background: #1e293b;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #334155;
  width: 100%;
  box-sizing: border-box;
}

.supplier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  width: 100%;
}

.supplier-card {
  width: 100%;
}

.supplier-card {
  background: #0f172a;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #334155;
  transition: all 0.2s;
}

.supplier-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.supplier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.supplier-name {
  font-size: 16px;
  font-weight: 600;
  color: #f8fafc;
}

.supplier-actions {
  display: flex;
  gap: 6px;
}

.btn-icon {
  padding: 6px 10px;
  background: #334155;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #475569;
}

.supplier-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.supplier-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 13px;
  color: #94a3b8;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
}

.products-title {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.products-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.product-tag {
  padding: 4px 10px;
  background: #1e293b;
  border-radius: 6px;
  font-size: 12px;
  color: #60a5fa;
  border: 1px solid #334155;
}

.product-tag.more {
  color: #94a3b8;
  border-color: #475569;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 16px;
  margin: 0;
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
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #334155;
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
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 24px;
  border-top: 1px solid #334155;
}

/* 表单 */
.form-section {
  display: flex;
  flex-direction: column;
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

.required {
  color: #ef4444;
  margin-left: 2px;
}

.form-input,
.form-textarea {
  padding: 10px 14px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f8fafc;
  font-size: 14px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* 商品选择器 */
.product-selector {
  margin-top: 8px;
}

.product-selector .search-box {
  position: relative;
}

.product-search-results {
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

.product-result-item {
  padding: 10px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: background 0.2s;
}

.product-result-item:hover {
  background: #334155;
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

.selected-products {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-product {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
}

.product-name {
  font-size: 13px;
  color: #f8fafc;
}

.btn-remove-product {
  padding: 2px 6px;
  background: #ef4444;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.btn-remove-product:hover {
  background: #dc2626;
}

.empty-products {
  margin-top: 12px;
  padding: 20px;
  background: #0f172a;
  border-radius: 8px;
  text-align: center;
}

.empty-text {
  color: #94a3b8;
  font-size: 14px;
}

.modal-large {
  max-width: 800px;
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .supplier-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
