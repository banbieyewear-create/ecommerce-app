<template>
  <div class="products-page">
    <div class="content-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-section">
          <h1 class="page-title">商品管理</h1>
          <p class="page-subtitle">管理您的所有商品信息、库存和销售数据</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" @click="exportData">
            <span>📥</span> 导出
          </button>
          <button class="btn btn-primary" @click="showAddModal = true">
            <span>➕</span> 新增商品
          </button>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-section">
        <div class="filter-group">
          <div class="search-input-wrapper">
            <span>🔍</span>
            <input type="text" v-model="searchKeyword" placeholder="搜索商品名称、SKU..." class="search-input" />
          </div>
          <select v-model="filterPlatform" class="filter-select">
            <option value="">全部平台</option>
            <option value="Temu">Temu</option>
            <option value="美客多 FTI">美客多 FTI</option>
            <option value="美客多半托管">美客多半托管</option>
            <option value="亚马逊">亚马逊</option>
          </select>
          <select v-model="filterStatus" class="filter-select">
            <option value="">全部状态</option>
            <option value="销售中">销售中</option>
            <option value="缺货">缺货</option>
            <option value="停售">停售</option>
          </select>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-label">总商品数</div>
          <div class="stat-value">{{ spus.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">销售中</div>
          <div class="stat-value">{{ spus.filter(s => s.status === '销售中').length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">库存预警</div>
          <div class="stat-value">{{ spus.filter(s => s.skus.some(k => k.stock < 50)).length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">缺货/停售</div>
          <div class="stat-value">{{ spus.filter(s => s.status === '缺货' || s.status === '停售').length }}</div>
        </div>
      </div>

      <!-- 表格 -->
      <div class="table-section">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 40px;"></th>
                <th style="width: 60px;">图片</th>
                <th style="width: 25%;">商品信息</th>
                <th style="width: 12%;">SKU</th>
                <th style="width: 10%;">规格</th>
                <th style="width: 10%;">平台</th>
                <th style="width: 8%;">库存</th>
                <th style="width: 12%;">售价</th>
                <th style="width: 80px;">操作</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="spu in filteredSpus" :key="spu.id">
                <!-- SPU 行 -->
                <tr class="spu-row">
                  <td>
                    <button class="btn-expand" @click="toggleExpand(spu.id)">
                      {{ expandedRows.includes(spu.id) ? '▼' : '▶' }}
                    </button>
                  </td>
                  <td>
                    <div class="product-thumb">{{ spu.image || '📦' }}</div>
                  </td>
                  <td>
                    <div class="product-name">{{ spu.name }}</div>
                    <div class="product-category">{{ spu.category }}</div>
                  </td>
                  <td><span class="sku-count">{{ spu.skus.length }} 个 SKU</span></td>
                  <td>-</td>
                  <td><span :class="['badge', 'platform-' + getPlatformKey(spu.platform)]">{{ spu.platform }}</span></td>
                  <td>{{ spu.skus.reduce((sum, sku) => sum + sku.stock, 0) }}</td>
                  <td>
                    <span class="price-value">${{ Math.min(...spu.skus.map(s => s.price)) }}</span>
                    <span v-if="spu.skus.length > 1" class="price-range">-${{ Math.max(...spu.skus.map(s => s.price)) }}</span>
                  </td>
                  <td>
                    <button class="btn-action" @click="addSku(spu)">➕</button>
                  </td>
                </tr>
                <!-- SKU 子行 -->
                <tr v-if="expandedRows.includes(spu.id)" v-for="sku in spu.skus" :key="sku.id" class="sku-row">
                  <td></td>
                  <td></td>
                  <td>
                    <div class="sku-name">└─ {{ spu.name }}</div>
                  </td>
                  <td><span class="sku-code">{{ sku.sku }}</span></td>
                  <td><span class="specs-badge">{{ sku.specs }}</span></td>
                  <td></td>
                  <td>
                    <span :class="{ 'text-warning': sku.stock < 50 }">{{ sku.stock }}</span>
                    <span v-if="sku.stockOnWay > 0" class="stock-onway">+{{ sku.stockOnWay }}</span>
                  </td>
                  <td>
                    <div class="price-usd">${{ sku.price }}</div>
                    <div class="price-cny">¥{{ sku.cost }}</div>
                  </td>
                  <td>
                    <button class="btn-action-sm" @click="openFileModal(spu, sku)" title="文件">📁</button>
                    <button class="btn-action-sm" @click="editSku(sku)">✏️</button>
                    <button class="btn-action-sm" @click="deleteSku(spu, sku)">🗑️</button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SKU 文件管理模态框 -->
    <div v-if="showFileModal" class="modal-overlay" @click.self="closeFileModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">📁 SKU 文件库</h3>
          <button class="modal-close" @click="closeFileModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="sku-info-bar" v-if="currentSku">
            <span class="sku-label">当前 SKU:</span>
            <span class="sku-badge">{{ currentSpu?.name }}</span>
            <span class="sku-code-badge">{{ currentSku.sku }}</span>
            <span class="specs-badge-sm">{{ currentSku.specs }}</span>
          </div>

          <!-- 文件上传区域 -->
          <div class="upload-area">
            <label class="upload-btn">
              <input type="file" multiple @change="uploadFiles" style="display: none" />
              <span class="upload-icon">📤</span>
              <span class="upload-text">点击或拖拽文件到此处上传</span>
              <span class="upload-hint">支持图片、文档、视频、压缩包等所有格式</span>
            </label>
          </div>

          <!-- 文件列表 -->
          <div class="file-list-section">
            <div class="file-list-header">
              <span class="file-count">已上传 {{ currentSku?.files?.length || 0 }} 个文件</span>
            </div>

            <div v-if="!currentSku?.files || currentSku.files.length === 0" class="empty-state">
              <span class="empty-icon">📂</span>
              <p class="empty-text">暂无文件，请上传</p>
            </div>

            <div v-else class="file-list">
              <div v-for="file in currentSku.files" :key="file.id" class="file-item">
                <div class="file-icon">{{ getFileIcon(file.type) }}</div>
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-meta">
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    <span class="file-time">{{ file.uploadTime }}</span>
                  </div>
                </div>
                <div class="file-actions">
                  <button class="btn-file-action" @click="downloadFile(file)" title="下载">⬇️</button>
                  <button class="btn-file-action" @click="deleteFile(file.id)" title="删除">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Products',
  data() {
    return {
      searchKeyword: '',
      filterPlatform: '',
      filterStatus: '',
      showAddModal: false,
      showFileModal: false,
      expandedRows: [],
      currentSpu: null,
      currentSku: null,
      spus: [
        {
          id: 'SPU-001',
          name: '无线蓝牙耳机',
          category: '3C 电子',
          image: '🎧',
          platform: 'Temu',
          status: '销售中',
          skus: [
            { id: '1', sku: 'TM-001-W', specs: '白色', cost: 45, price: 19.99, stock: 300, stockOnWay: 100, files: [] },
            { id: '2', sku: 'TM-001-B', specs: '黑色', cost: 45, price: 19.99, stock: 200, stockOnWay: 100, files: [] }
          ]
        },
        {
          id: 'SPU-002',
          name: '便携式榨汁杯',
          category: '家居用品',
          image: '🥤',
          platform: '美客多 FTI',
          status: '销售中',
          skus: [
            { id: '3', sku: 'ML-002', specs: '标准款', cost: 68, price: 35.99, stock: 180, stockOnWay: 0, files: [] }
          ]
        },
        {
          id: 'SPU-003',
          name: 'LED 化妆镜',
          category: '美妆工具',
          image: '🪞',
          platform: '美客多半托管',
          status: '缺货',
          skus: [
            { id: '4', sku: 'ML-003-S', specs: '小号', cost: 32, price: 24.99, stock: 15, stockOnWay: 50, files: [] },
            { id: '5', sku: 'ML-003-L', specs: '大号', cost: 38, price: 29.99, stock: 10, stockOnWay: 50, files: [] }
          ]
        },
        {
          id: 'SPU-004',
          name: '智能手表',
          category: '3C 电子',
          image: '⌚',
          platform: '亚马逊',
          status: '销售中',
          skus: [
            { id: '6', sku: 'AMZ-004-B', specs: '黑色', cost: 120, price: 79.99, stock: 200, stockOnWay: 100, files: [] },
            { id: '7', sku: 'AMZ-004-S', specs: '银色', cost: 120, price: 79.99, stock: 150, stockOnWay: 50, files: [] }
          ]
        },
        {
          id: 'SPU-005',
          name: 'USB 充电线',
          category: '3C 配件',
          image: '🔌',
          platform: 'Temu',
          status: '销售中',
          skus: [
            { id: '8', sku: 'TM-005-1M', specs: '1 米', cost: 5, price: 6.99, stock: 500, stockOnWay: 200, files: [] },
            { id: '9', sku: 'TM-005-2M', specs: '2 米', cost: 8, price: 9.99, stock: 400, stockOnWay: 200, files: [] },
            { id: '10', sku: 'TM-005-3M', specs: '3 米', cost: 12, price: 12.99, stock: 300, stockOnWay: 100, files: [] }
          ]
        }
      ]
    }
  },
  computed: {
    filteredSpus() {
      return this.spus.filter(spu => {
        const matchSearch = !this.searchKeyword || spu.name.includes(this.searchKeyword) || spu.skus.some(k => k.sku.includes(this.searchKeyword))
        const matchPlatform = !this.filterPlatform || spu.platform === this.filterPlatform
        const matchStatus = !this.filterStatus || spu.status === this.filterStatus
        return matchSearch && matchPlatform && matchStatus
      })
    }
  },
  methods: {
    getPlatformKey(p) {
      const map = { 'Temu': 'temu', '美客多 FTI': 'ml', '美客多半托管': 'ml-ht', '亚马逊': 'amz' }
      return map[p] || ''
    },
    toggleExpand(spuId) {
      const index = this.expandedRows.indexOf(spuId)
      if (index > -1) {
        this.expandedRows.splice(index, 1)
      } else {
        this.expandedRows.push(spuId)
      }
    },
    addSku(spu) {
      const newSku = {
        id: Date.now().toString(),
        sku: `${spu.platform.toUpperCase()}-${Date.now()}`,
        specs: '新规格',
        cost: 0,
        price: 0,
        stock: 0,
        stockOnWay: 0
      }
      spu.skus.push(newSku)
      if (!this.expandedRows.includes(spu.id)) {
        this.expandedRows.push(spu.id)
      }
    },
    editSku(sku) {
      const newPrice = prompt('修改售价:', sku.price)
      if (newPrice) sku.price = parseFloat(newPrice)
      const newStock = prompt('修改库存:', sku.stock)
      if (newStock) sku.stock = parseInt(newStock)
    },
    deleteSku(spu, sku) {
      if (confirm(`确定删除 SKU "${sku.sku}" 吗？`)) {
        const index = spu.skus.findIndex(k => k.id === sku.id)
        if (index > -1) spu.skus.splice(index, 1)
      }
    },
    openFileModal(spu, sku) {
      this.currentSpu = spu
      this.currentSku = sku
      this.showFileModal = true
    },
    closeFileModal() {
      this.showFileModal = false
      this.currentSpu = null
      this.currentSku = null
    },
    uploadFiles(event) {
      const files = event.target.files
      if (!files || files.length === 0) return
      if (!this.currentSku) return
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileUrl = URL.createObjectURL(file)
        this.currentSku.files.push({
          id: Date.now() + i,
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl,
          uploadTime: new Date().toLocaleString('zh-CN')
        })
      }
      alert(`已上传 ${files.length} 个文件到 SKU "${this.currentSku.sku}"`)
      event.target.value = ''
    },
    deleteFile(fileId) {
      if (!this.currentSku) return
      const index = this.currentSku.files.findIndex(f => f.id === fileId)
      if (index > -1) {
        if (confirm('确定删除此文件吗？')) {
          this.currentSku.files.splice(index, 1)
        }
      }
    },
    downloadFile(file) {
      const a = document.createElement('a')
      a.href = file.url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },
    getFileIcon(type) {
      if (type.startsWith('image/')) return '🖼️'
      if (type.includes('pdf')) return '📄'
      if (type.includes('word') || type.includes('document')) return '📝'
      if (type.includes('excel') || type.includes('sheet')) return '📊'
      if (type.includes('video')) return '🎬'
      if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦'
      return '📎'
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },
    exportData() {
      alert('导出功能开发中...')
    }
  }
}
</script>

<style scoped>
.products-page {
  width: 100%;
  height: 100%;
  padding: 24px;
  overflow: auto;
  background: var(--bg-primary);
}

.content-container {
  width: calc(100% - 48px);
  margin: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.btn-outline {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.filter-section {
  display: flex;
  gap: 16px;
}

.filter-group {
  display: flex;
  gap: 10px;
  flex: 1;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  flex: 1;
  max-width: 280px;
}

.search-input-wrapper:focus-within {
  border-color: var(--primary-color);
}

.search-input {
  border: none;
  background: none;
  outline: none;
  font-size: 13px;
  color: var(--text-primary);
  flex: 1;
}

.filter-select {
  padding: 9px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
}

.filter-select:focus {
  border-color: var(--primary-color);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--border-color);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.table-section {
  width: 100%;
}

.table-wrapper {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  width: 100%;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
}

.spu-row {
  background: var(--bg-secondary);
}

.spu-row:hover {
  background: var(--bg-hover);
}

.sku-row {
  background: var(--bg-hover);
}

.sku-row:hover {
  background: var(--bg-muted);
}

.btn-expand {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--text-secondary);
}

.btn-expand:hover {
  background: var(--bg-hover);
  color: var(--primary-color);
}

.product-thumb {
  width: 48px;
  height: 48px;
  background: var(--bg-hover);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.product-category {
  font-size: 12px;
  color: var(--text-tertiary);
}

.sku-name {
  font-size: 13px;
  color: var(--text-secondary);
  padding-left: 20px;
}

.sku-count {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 4px 8px;
  border-radius: 4px;
}

.sku-code {
  font-size: 12px;
  color: var(--primary-color);
  font-family: monospace;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.specs-badge {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 4px 10px;
  border-radius: 12px;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.platform-temu { background: rgba(245, 63, 63, 0.12); color: #f53f3f; }
.platform-ml { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
.platform-ml-ht { background: rgba(16, 185, 129, 0.12); color: #10b981; }
.platform-amz { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }

.price-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-color);
}

.price-range {
  font-size: 12px;
  color: var(--text-tertiary);
}

.price-usd {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-color);
}

.price-cny {
  font-size: 10px;
  color: var(--text-tertiary);
}

.stock-onway {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-left: 4px;
}

.btn-action {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
}

.btn-action:hover {
  background: var(--bg-hover);
  opacity: 1;
}

.btn-action-sm {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
}

.btn-action-sm:hover {
  background: var(--bg-hover);
  opacity: 1;
}

.text-warning {
  color: var(--warning-color);
}

/* SKU 文件管理模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: var(--bg-secondary);
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sku-info-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg-hover);
  border-radius: 10px;
  flex-wrap: wrap;
}

.sku-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

.sku-badge {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.sku-code-badge {
  font-size: 12px;
  color: var(--primary-color);
  font-family: monospace;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.specs-badge-sm {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 4px 10px;
  border-radius: 12px;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-area:hover {
  border-color: var(--primary-color);
  background: rgba(59, 130, 246, 0.05);
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 100%;
}

.upload-icon {
  font-size: 36px;
  margin-bottom: 4px;
}

.upload-text {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 文件列表 */
.file-list-section {
  flex: 1;
}

.file-list-header {
  margin-bottom: 12px;
}

.file-count {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  margin: 0;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-hover);
  border-radius: 10px;
  transition: all 0.2s;
}

.file-item:hover {
  background: var(--bg-muted);
}

.file-icon {
  font-size: 28px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.file-size {
  font-family: monospace;
}

.file-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btn-file-action {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: all 0.2s;
  opacity: 0.7;
}

.btn-file-action:hover {
  background: var(--bg-secondary);
  opacity: 1;
}
</style>
