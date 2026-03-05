<template>
  <div class="products-page">
    <div class="content-wrapper">
      <!-- 页面头部 -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-title">
            <h1>商品管理</h1>
            <p>管理您的所有商品信息、库存和销售数据</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" @click="showImportModal = true">
              <span class="icon">📥</span>
              <span class="text">导入</span>
            </button>
            <button class="btn btn-outline" @click="exportData">
              <span class="icon">📥</span>
              <span class="text">导出</span>
            </button>
            <button class="btn btn-primary" @click="showAddModal = true">
              <span class="icon">➕</span>
              <span class="text">新增商品</span>
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
              placeholder="搜索商品名称、SKU..."
              class="search-input"
            />
            <button v-if="searchKeyword" class="clear-btn" @click="searchKeyword = ''">✕</button>
          </div>
          <div class="filters">
            <div class="filter-item">
              <select v-model="filterPlatform" class="filter-select">
                <option value="">全部平台</option>
                <option value="Temu">Temu</option>
                <option value="美客多 FTI">美客多 FTI</option>
                <option value="美客多半托管">美客多半托管</option>
                <option value="亚马逊">亚马逊</option>
              </select>
            </div>
            <div class="filter-item">
              <select v-model="filterStatus" class="filter-select">
                <option value="">全部状态</option>
                <option value="销售中">销售中</option>
                <option value="缺货">缺货</option>
                <option value="停售">停售</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- 统计卡片区 -->
      <section class="stats-section">
        <StatCard 
          icon="📦" 
          label="总商品数" 
          :value="spus.length" 
          color="blue"
          class="stat-item"
        />
        <StatCard 
          icon="✓" 
          label="销售中" 
          :value="activeCount" 
          color="green"
          class="stat-item"
        />
        <StatCard 
          icon="!" 
          label="库存预警" 
          :value="warningCount" 
          color="yellow"
          class="stat-item"
        />
        <StatCard 
          icon="✕" 
          label="缺货/停售" 
          :value="inactiveCount" 
          color="red"
          class="stat-item"
        />
      </section>

      <!-- 数据表格 -->
      <section class="table-section">
        <div class="table-container">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col-expand" style="width: 40px;"></th>
                  <th class="col-image" style="width: 60px;">图片</th>
                  <th class="col-product" style="width: 18%;">商品信息</th>
                  <th class="col-partnumber" style="width: 10%;">主货号</th>
                  <th class="col-shop" style="width: 12%;">店铺名称</th>
                  <th class="col-specs" style="width: 12%;">产品规格</th>
                  <th class="col-skcid" style="width: 12%;">SKCID</th>
                  <th class="col-stock" style="width: 8%;">库存</th>
                  <th class="col-price" style="width: 10%;">供货价</th>
                  <th class="col-actions" style="width: 80px;">操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="spu in filteredSpus" :key="spu.id">
                  <!-- SPU 行 -->
                  <tr class="spu-row" :class="{ 'expanded': expandedRows.includes(spu.id) }">
                    <td class="col-expand">
                      <button class="btn-expand" @click="toggleExpand(spu.id)">
                        {{ expandedRows.includes(spu.id) ? '▼' : '▶' }}
                      </button>
                    </td>
                    <td class="col-image">
                      <div class="product-thumb" @click="showImagePreview(spu)" style="cursor: pointer;">
                        <img v-if="spu.materials" :src="spu.materials" :alt="spu.name" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" />
                        <span v-else>📦</span>
                      </div>
                    </td>
                    <td class="col-product">
                      <div class="product-info">
                        <div class="product-name">{{ spu.name }}</div>
                        <div class="product-category">{{ spu.fullCategory || spu.category }}</div>
                      </div>
                    </td>
                    <td class="col-partnumber">
                      <span class="part-number">{{ spu.mainPartNumber || '-' }}</span>
                    </td>
                    <td class="col-shop">
                      <span class="shop-name">{{ spu.shopName || '-' }}</span>
                    </td>
                    <td class="col-specs">
                      <span class="specs-placeholder">-</span>
                    </td>
                    <td class="col-skcid">
                      <span class="sku-cid">{{ spu.skuCid || '-' }}</span>
                    </td>
                    <td class="col-stock">
                      <span class="stock-value">{{ spu.skus.reduce((sum, sku) => sum + sku.stock, 0) }}</span>
                    </td>
                    <td class="col-price">
                      <div class="price-range">
                        <span class="price-min">¥{{ minCost(spu) }}</span>
                      </div>
                    </td>
                    <td class="col-actions">
                      <div class="action-group">
                        <button class="btn-action-sm" @click="editProduct(spu)" title="编辑产品">
                          <span>✏️</span>
                        </button>
                        <button class="btn-action" @click="addSku(spu)" title="添加 SKU">
                          <span>➕</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <!-- SKU 子行 -->
                  <tr v-if="expandedRows.includes(spu.id)" v-for="sku in spu.skus" :key="sku.id" class="sku-row">
                    <td class="col-expand"></td>
                    <td class="col-image"></td>
                    <td class="col-product"></td>
                    <td class="col-partnumber"></td>
                    <td class="col-shop"></td>
                    <td class="col-specs">
                      <div class="sku-specs">
                        <div class="spec-item">
                          <span class="spec-label">规格:</span>
                          <span class="spec-value">{{ sku.specs }}</span>
                        </div>
                        <div class="spec-item">
                          <span class="spec-label">SKUID:</span>
                          <span class="spec-value sku-id">{{ sku.sku }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="col-skcid">
                      <span class="sku-cid">{{ sku.skuCid || spu.skuCid || '-' }}</span>
                    </td>
                    <td class="col-stock">
                      <span class="stock-value">{{ sku.stock }}</span>
                      <span v-if="sku.stockOnWay > 0" class="stock-onway">+{{ sku.stockOnWay }}</span>
                    </td>
                    <td class="col-price">
                      <div class="price-detail">
                        <span class="price-cost">¥{{ sku.cost }}</span>
                      </div>
                    </td>
                    <td class="col-actions">
                      <div class="action-group">
                        <button class="btn-action-sm" @click="editSku(sku)" title="编辑">
                          <span>✏️</span>
                        </button>
                        <button class="btn-action-sm" @click="deleteSku(spu, sku)" title="删除">
                          <span>🗑️</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- 图片预览模态框 -->
      <div v-if="previewImage" class="image-preview-overlay" @click="closeImagePreview">
        <div class="image-preview-modal" @click.stop>
          <button class="image-preview-close" @click="closeImagePreview">✕</button>
          <img :src="previewImage" alt="商品图片" class="image-preview-content" />
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <div class="pagination-info">
          显示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredSpus.length + (currentPage - 1) * pageSize) }} 条，共 {{ spus.filter(spu => {
            const matchSearch = !this.searchKeyword || spu.name.includes(this.searchKeyword) || spu.skus.some(k => k.sku.includes(this.searchKeyword))
            const matchPlatform = !this.filterPlatform || spu.platform === this.filterPlatform
            const matchStatus = !this.filterStatus || spu.status === this.filterStatus
            return matchSearch && matchPlatform && matchStatus
          }).length }} 条
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

    <!-- 导入模态框 -->
    <div v-if="showImportModal" class="modal-overlay" @click.self="showImportModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">📥 导入商品数据</h3>
          <button class="modal-close" @click="showImportModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="import-instructions">
            <h4>📋 导入说明</h4>
            <p>支持导入 TSV/TXT 格式文件，包含以下字段：</p>
            <div class="field-list">
              <div class="field-item"><span class="field-name">SKUID</span></div>
              <div class="field-item"><span class="field-name">店铺 ID</span></div>
              <div class="field-item"><span class="field-name">店铺名称</span></div>
              <div class="field-item"><span class="field-name">产品 ID</span></div>
              <div class="field-item"><span class="field-name">产品名称</span></div>
              <div class="field-item"><span class="field-name">产品分类</span></div>
              <div class="field-item"><span class="field-name">主货号</span></div>
              <div class="field-item"><span class="field-name">产地</span></div>
              <div class="field-item"><span class="field-name">站外产品链接</span></div>
              <div class="field-item"><span class="field-name">产品轮播图链接</span></div>
              <div class="field-item"><span class="field-name">产品素材图链接</span></div>
              <div class="field-item"><span class="field-name">产品规格</span></div>
              <div class="field-item"><span class="field-name">供货价</span></div>
              <div class="field-item"><span class="field-name">尺寸</span></div>
              <div class="field-item"><span class="field-name">重量</span></div>
              <div class="field-item"><span class="field-name">平台 SKU</span></div>
              <div class="field-item"><span class="field-name">包装信息</span></div>
              <div class="field-item"><span class="field-name">SKCID</span></div>
              <div class="field-item"><span class="field-name">生命周期</span></div>
              <div class="field-item"><span class="field-name">产品类型</span></div>
              <div class="field-item"><span class="field-name">JIT 库存</span></div>
            </div>
            <p class="import-hint">💡 相同的 SKCID 会合并为同一个产品，不同的 SKUID 为不同规格</p>
          </div>

          <div class="upload-area">
            <label class="upload-btn">
              <input type="file" accept=".tsv,.txt,.csv" @change="handleImportFile" style="display: none" />
              <span class="upload-icon">📄</span>
              <span class="upload-text">点击选择文件</span>
              <span class="upload-hint">支持 TSV、TXT、CSV 格式</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑产品模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">✏️ 编辑产品信息</h3>
          <button class="modal-close" @click="closeEditModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-section">
            <div class="form-group">
              <label class="form-label">产品名称</label>
              <input 
                type="text" 
                v-model="editForm.name" 
                class="form-input"
                placeholder="请输入产品名称"
              />
            </div>
            <div class="form-group">
              <label class="form-label">产品分类</label>
              <input 
                type="text" 
                v-model="editForm.fullCategory" 
                class="form-input"
                placeholder="如：3C 电子>数码配件>蓝牙耳机"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">主货号</label>
                <input 
                  type="text" 
                  v-model="editForm.mainPartNumber" 
                  class="form-input"
                  placeholder="主货号"
                />
              </div>
              <div class="form-group">
                <label class="form-label">店铺名称</label>
                <input 
                  type="text" 
                  v-model="editForm.shopName" 
                  class="form-input"
                  placeholder="店铺名称"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">供货价</label>
                <input 
                  type="number" 
                  v-model.number="editForm.cost" 
                  class="form-input"
                  placeholder="供货价"
                  step="0.01"
                />
              </div>
              <div class="form-group">
                <label class="form-label">状态</label>
                <select v-model="editForm.status" class="form-select">
                  <option value="销售中">销售中</option>
                  <option value="缺货">缺货</option>
                  <option value="停售">停售</option>
                  <option value="清仓">清仓</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">产品图片 URL</label>
              <input 
                type="text" 
                v-model="editForm.materials" 
                class="form-input"
                placeholder="图片链接地址"
              />
            </div>
            <div class="form-group">
              <label class="form-label">平台 SKU（每行一个，按 SKU 顺序）</label>
              <textarea 
                v-model="editForm.platformSkus" 
                class="form-textarea"
                placeholder="每行一个平台 SKU，按 SKU 顺序填写"
                rows="5"
              ></textarea>
              <div class="form-hint">共 {{ currentSpu?.skus?.length || 0 }} 个 SKU，当前：{{ currentSpu?.skus?.map(s => s.platformSku || '').filter(Boolean).length || 0 }} 个已填写</div>
            </div>
            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea 
                v-model="editForm.remarks" 
                class="form-textarea"
                placeholder="备注信息"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeEditModal">取消</button>
          <button class="btn btn-primary" @click="saveEditProduct">保存修改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StatCard from '../../components/common/StatCard.vue'

export default {
  name: 'ProductsPage',
  components: {
    StatCard
  },
  data() {
    return {
      searchKeyword: '',
      filterPlatform: '',
      filterStatus: '',
      showAddModal: false,
      showImportModal: false,
      showFileModal: false,
      showEditModal: false,
      previewImage: null,
      currentSpu: null,
      currentSku: null,
      editForm: {
        name: '',
        fullCategory: '',
        mainPartNumber: '',
        shopName: '',
        cost: 0,
        status: '销售中',
        materials: '',
        platformSkus: '',
        remarks: ''
      },
      expandedRows: [],
      importData: null,
      currentPage: 1,
      pageSize: 20,
      spus: [
        {
          id: 'SPU-74501612166',
          name: '无线蓝牙耳机',
          category: '3C 电子',
          fullCategory: '3C 电子>数码配件>蓝牙耳机',
          image: '🎧',
          platform: 'Temu',
          status: '销售中',
          mainPartNumber: '58416',
          shopName: 'Bambi Eyewear',
          skuCid: '74501612166',
          skus: [
            { id: '80431150050', sku: '80431150050', specs: '灰粉色', cost: 70, price: 105, stock: 300, stockOnWay: 100, files: [], skuCid: '74501612166' },
            { id: '22082125941', sku: '22082125941', specs: '黑灰色', cost: 70, price: 105, stock: 200, stockOnWay: 100, files: [], skuCid: '74501612166' }
          ]
        },
        {
          id: 'SPU-97436561922',
          name: '便携式榨汁杯',
          category: '家居用品',
          fullCategory: '家居用品>厨房电器>榨汁机',
          image: '🥤',
          platform: '美客多 FTI',
          status: '销售中',
          mainPartNumber: '231',
          shopName: 'Bambi Eyewear',
          skuCid: '97436561922',
          skus: [
            { id: '53406029336', sku: '53406029336', specs: '蓝色', cost: 68, price: 102, stock: 180, stockOnWay: 0, files: [], skuCid: '97436561922' }
          ]
        },
        {
          id: 'SPU-86433550175',
          name: 'LED 化妆镜',
          category: '美妆工具',
          fullCategory: '美妆工具>化妆镜>LED 镜',
          image: '🪞',
          platform: '美客多半托管',
          status: '缺货',
          mainPartNumber: '500',
          shopName: 'Bambi Eyewear',
          skuCid: '86433550175',
          skus: [
            { id: '14750631195', sku: '14750631195', specs: '粉色', cost: 32, price: 48, stock: 15, stockOnWay: 50, files: [], skuCid: '86433550175' },
            { id: '96542246873', sku: '96542246873', specs: '豆花', cost: 38, price: 57, stock: 10, stockOnWay: 50, files: [], skuCid: '86433550175' }
          ]
        },
        {
          id: 'SPU-32947815208',
          name: '智能手表',
          category: '3C 电子',
          fullCategory: '3C 电子>智能穿戴>智能手表',
          image: '⌚',
          platform: '亚马逊',
          status: '销售中',
          mainPartNumber: '3824-51810',
          shopName: 'Bambi Eyewear',
          skuCid: '32947815208',
          skus: [
            { id: '65527991837', sku: '65527991837', specs: '茶色', cost: 120, price: 180, stock: 200, stockOnWay: 100, files: [], skuCid: '32947815208' },
            { id: '84017432359', sku: '84017432359', specs: '粉色', cost: 120, price: 180, stock: 150, stockOnWay: 50, files: [], skuCid: '32947815208' }
          ]
        },
        {
          id: 'SPU-10685541984',
          name: 'USB 充电线',
          category: '3C 配件',
          fullCategory: '3C 配件>数据线>充电线',
          image: '🔌',
          platform: 'Temu',
          status: '销售中',
          mainPartNumber: '6261-51810',
          shopName: 'Bambi Eyewear',
          skuCid: '10685541984',
          skus: [
            { id: '55681165506', sku: '55681165506', specs: '白色', cost: 5, price: 7.5, stock: 500, stockOnWay: 200, files: [], skuCid: '10685541984' },
            { id: '51451668277', sku: '51451668277', specs: '紫黄', cost: 8, price: 12, stock: 400, stockOnWay: 200, files: [], skuCid: '10685541984' },
            { id: '8246566990', sku: '8246566990', specs: '豹纹', cost: 12, price: 18, stock: 300, stockOnWay: 100, files: [], skuCid: '10685541984' }
          ]
        }
      ]
    }
  },
  created() {
    // 页面创建时从 localStorage 加载数据
    const products = localStorage.getItem('ecommerce-products')
    if (products) {
      try {
        this.spus = JSON.parse(products)
      } catch (e) {
        console.error('加载产品数据失败:', e)
      }
    }
  },
  methods: {
    saveProducts() {
      localStorage.setItem('ecommerce-products', JSON.stringify(this.spus))
      window.dispatchEvent(new CustomEvent('products-updated'))
    }
  },
  computed: {
    filteredSpus() {
      const filtered = this.spus.filter(spu => {
        // 搜索匹配
        const matchSearch = !this.searchKeyword || 
          spu.name.includes(this.searchKeyword) || 
          spu.skus.some(k => k.sku.includes(this.searchKeyword)) ||
          spu.mainPartNumber?.includes(this.searchKeyword) ||
          spu.skuCid?.includes(this.searchKeyword) ||
          spu.skus.some(k => k.skuCid?.includes(this.searchKeyword))
        const matchPlatform = !this.filterPlatform || spu.platform === this.filterPlatform
        const matchStatus = !this.filterStatus || spu.status === this.filterStatus
        return matchSearch && matchPlatform && matchStatus
      })
      
      // 分页
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return filtered.slice(start, end)
    },
    totalPages() {
      const filtered = this.spus.filter(spu => {
        const matchSearch = !this.searchKeyword || 
          spu.name.includes(this.searchKeyword) || 
          spu.skus.some(k => k.sku.includes(this.searchKeyword)) ||
          spu.mainPartNumber?.includes(this.searchKeyword) ||
          spu.skuCid?.includes(this.searchKeyword) ||
          spu.skus.some(k => k.skuCid?.includes(this.searchKeyword))
        const matchPlatform = !this.filterPlatform || spu.platform === this.filterPlatform
        const matchStatus = !this.filterStatus || spu.status === this.filterStatus
        return matchSearch && matchPlatform && matchStatus
      })
      return Math.ceil(filtered.length / this.pageSize)
    },
    activeCount() {
      return this.spus.filter(s => s.status === '销售中').length
    },
    warningCount() {
      return this.spus.filter(s => s.skus.some(k => k.stock < 50)).length
    },
    inactiveCount() {
      return this.spus.filter(s => s.status === '缺货' || s.status === '停售').length
    }
  },
  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    getPlatformKey(platform) {
      const map = { 'Temu': 'temu', '美客多 FTI': 'ml', '美客多半托管': 'ml-ht', '亚马逊': 'amz', '店铺': 'shop' }
      return map[platform] || 'shop'
    },
    getLifecycleKey(lifecycle) {
      if (!lifecycle) return 'pending'
      const map = {
        '已加入站点': 'active',
        '核价未通过': 'rejected',
        '待下首单': 'pending_order',
        '待上架': 'pending'
      }
      return map[lifecycle] || 'pending'
    },
    toggleExpand(spuId) {
      const index = this.expandedRows.indexOf(spuId)
      if (index > -1) {
        this.expandedRows.splice(index, 1)
      } else {
        this.expandedRows.push(spuId)
      }
    },
    minPrice(spu) {
      return Math.min(...spu.skus.map(s => s.price))
    },
    maxPrice(spu) {
      return Math.max(...spu.skus.map(s => s.price))
    },
    minCost(spu) {
      const costs = spu.skus.map(s => s.cost).filter(c => c > 0)
      return costs.length > 0 ? Math.min(...costs).toFixed(2) : '0.00'
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
    showImagePreview(spu) {
      if (spu.materials) {
        this.previewImage = spu.materials
      }
    },
    closeImagePreview() {
      this.previewImage = null
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
    // 编辑产品
    editProduct(spu) {
      this.currentSpu = spu
      // 生成平台 SKU 列表（每行一个）
      const platformSkusText = spu.skus.map(s => s.platformSku || '').join('\n')
      this.editForm = {
        name: spu.name || '',
        fullCategory: spu.fullCategory || '',
        mainPartNumber: spu.mainPartNumber || '',
        shopName: spu.shopName || '',
        cost: spu.skus.length > 0 ? spu.skus[0].cost : 0,
        status: spu.status || '销售中',
        materials: spu.materials || '',
        platformSkus: platformSkusText,
        remarks: spu.remarks || ''
      }
      this.showEditModal = true
    },
    closeEditModal() {
      this.showEditModal = false
      this.currentSpu = null
      this.editForm = {
        name: '',
        fullCategory: '',
        mainPartNumber: '',
        shopName: '',
        cost: 0,
        status: '销售中',
        materials: '',
        platformSkus: '',
        remarks: ''
      }
    },
    saveEditProduct() {
      if (!this.currentSpu) return
      
      // 更新产品信息
      this.currentSpu.name = this.editForm.name
      this.currentSpu.fullCategory = this.editForm.fullCategory
      this.currentSpu.mainPartNumber = this.editForm.mainPartNumber
      this.currentSpu.shopName = this.editForm.shopName
      this.currentSpu.status = this.editForm.status
      this.currentSpu.materials = this.editForm.materials
      this.currentSpu.remarks = this.editForm.remarks
      
      // 更新平台 SKU（按行解析）
      if (this.currentSpu.skus && this.currentSpu.skus.length > 0) {
        const platformSkusLines = this.editForm.platformSkus.split('\n')
        this.currentSpu.skus.forEach((sku, index) => {
          // 更新供货价
          sku.cost = this.editForm.cost
          sku.price = this.editForm.cost > 0 ? this.editForm.cost * 1.5 : 0
          // 更新平台 SKU（如果该行有值）
          if (platformSkusLines[index] !== undefined) {
            sku.platformSku = platformSkusLines[index].trim()
          }
        })
      }
      
      // 保存到 localStorage
      localStorage.setItem('ecommerce-products', JSON.stringify(this.spus))
      window.dispatchEvent(new CustomEvent('products-updated'))
      
      alert('✅ 产品信息已保存！')
      this.closeEditModal()
    },
    handleImportFile(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target.result
          const lines = content.split('\n').filter(line => line.trim())
          
          // 检测分隔符（逗号或制表符）
          const firstLine = lines[0]
          const delimiter = firstLine.includes('\t') ? '\t' : ','
          
          console.log('分隔符类型:', delimiter === '\t' ? '制表符' : '逗号')
          console.log('总行数:', lines.length)
          
          // 解析表头
          const headers = firstLine.split(delimiter).map(h => h.trim())
          console.log('表头列数:', headers.length)
          console.log('表头:', headers)
          
          // 解析数据
          const skuData = []
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue
            
            // 使用正则表达式处理带引号的 CSV 字段
            const values = []
            let current = ''
            let inQuotes = false
            
            for (let j = 0; j < line.length; j++) {
              const char = line[j]
              if (char === '"') {
                inQuotes = !inQuotes
              } else if (char === delimiter && !inQuotes) {
                values.push(current.trim().replace(/^"|"$/g, ''))
                current = ''
              } else {
                current += char
              }
            }
            values.push(current.trim().replace(/^"|"$/g, ''))
            
            if (values.length < 10) continue
            
            // 调试：打印前 3 行的关键数据
            if (i < 4) {
              console.log(`行${i}:`, {
                skuId: values[0],
                shopName: values[2],
                mainPartNumber: values[6],
                materials: values[10],
                specs: values[11],
                supplyPrice: values[12],
                weight: values[14],
                platformSku: values[15],
                skuCid: values[17],
                lifecycle: values[18],
                jitStock: values[20]
              })
            }
            
            skuData.push({
              skuId: (values[0] || '').replace(/"/g, '').trim(),
              shopId: (values[1] || '').replace(/"/g, '').trim(),
              shopName: (values[2] || '').replace(/"/g, '').trim(),
              productId: (values[3] || '').replace(/"/g, '').trim(),
              productName: (values[4] || '').replace(/"/g, '').trim(),
              category: (values[5] || '').replace(/"/g, '').trim(),
              mainPartNumber: (values[6] || '').replace(/"/g, '').trim(),
              origin: (values[7] || '').replace(/"/g, '').trim(),
              externalLink: (values[8] || '').replace(/"/g, '').trim(),
              images: (values[9] || '').replace(/"/g, '').trim(),
              materials: (values[10] || '').replace(/"/g, '').trim(),
              specs: (values[11] || '').replace(/"/g, '').trim(),
              supplyPrice: (values[12] || '').replace(/"/g, '').replace('0CNY', '').trim() || '0',
              size: (values[13] || '').replace(/"/g, '').trim(),
              weight: (values[14] || '').replace(/"/g, '').trim(),
              platformSku: (values[15] || '').replace(/"/g, '').trim(),
              packageInfo: (values[16] || '').replace(/"/g, '').trim(),
              skuCid: (values[17] || '').replace(/"/g, '').trim(),
              lifecycle: (values[18] || '').replace(/"/g, '').trim(),
              productType: (values[19] || '').replace(/"/g, '').trim(),
              jitStock: (values[20] || '').replace(/"/g, '').trim() || '0'
            })
          }
          
          console.log('解析的 SKU 数量:', skuData.length)
          console.log('前 3 个 SKU 的 SKCID:', skuData.slice(0, 3).map(s => s.skuCid))
          this.processImportData(skuData)
          alert(`✅ 导入成功！\n产品数：${skuData.length}`)
          this.showImportModal = false
        } catch (error) {
          console.error('导入错误:', error)
          alert('导入失败：' + error.message)
        }
      }
      reader.readAsText(file, 'UTF-8')
    },
    processImportData(skuData) {
      console.log('开始导入，SKU 数量:', skuData.length)
      
      // 按 SKCID 分组，相同 SKCID 为同一个产品
      const productMap = new Map()
      
      skuData.forEach(sku => {
        try {
          const skuCid = sku.skuCid || 'UNKNOWN-' + sku.productId
          
          if (!productMap.has(skuCid)) {
            // 提取主分类
            const mainCategory = sku.category.split('>')[0]?.trim() || '其他'
            
            productMap.set(skuCid, {
              id: 'SPU-' + skuCid,
              name: sku.productName || '未命名商品',
              category: mainCategory,
              fullCategory: sku.category,
              image: '📦',
              platform: sku.shopName || '店铺',
              status: sku.lifecycle === '已加入站点' ? '销售中' : (sku.lifecycle === '核价未通过' ? '停售' : '销售中'),
              mainPartNumber: sku.mainPartNumber,
              shopName: sku.shopName,
              shopId: sku.shopId,
              productId: sku.productId,
              origin: sku.origin,
              externalLink: sku.externalLink,
              images: sku.images,
              materials: sku.materials,
              size: sku.size,
              weight: sku.weight,
              packageInfo: sku.packageInfo,
              productType: sku.productType,
              skuCid: skuCid,
              skus: []
            })
          }
          
          const product = productMap.get(skuCid)
          
          // 解析供货价（去除 0CNY 前缀）
          const priceStr = sku.supplyPrice.replace('0CNY', '').trim()
          const cost = parseFloat(priceStr) || 0
          
          product.skus.push({
            id: sku.skuId || Date.now().toString() + Math.random(),
            sku: sku.skuId,  // SKUID
            specs: sku.specs || '默认规格',
            cost: cost,
            price: cost > 0 ? cost * 1.5 : 0,
            stock: parseInt(sku.jitStock) || 0,
            stockOnWay: 0,
            files: [],
            size: sku.size,
            weight: sku.weight,
            packageInfo: sku.packageInfo,
            lifecycle: sku.lifecycle,
            productType: sku.productType,
            images: sku.images,
            materials: sku.materials,
            skuCid: skuCid,
            platformSku: sku.platformSku  // 保存平台 SKU
          })
        } catch (err) {
          console.error('处理 SKU 失败:', sku.skuId, err)
        }
      })
      
      // 清空现有数据，添加导入的数据
      this.spus = []
      productMap.forEach(product => {
        this.spus.push(product)
      })
      
      console.log('导入完成，产品数量:', this.spus.length)
      console.log('导入的产品:', this.spus.slice(0, 5).map(p => ({ name: p.name, skuCid: p.skuCid, skuCount: p.skus.length })))
      
      // 保存到 localStorage，供商品文件页面使用
      localStorage.setItem('ecommerce-products', JSON.stringify(this.spus))
      // 通知商品文件页面数据已更新
      window.dispatchEvent(new CustomEvent('products-updated'))
      
      alert(`✅ 导入成功！\n产品数：${productMap.size}\nSKU 总数：${skuData.length}`)
    }
  }
}
</script>

<style scoped>
/* ========== 页面布局 ========== */
.products-page {
  width: 100%;
  min-height: 100%;
  padding: 0;
  background: var(--bg-primary);
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

/* ========== 页面头部 ========== */
.page-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border-color);
  margin-bottom: 8px;
}

.header-content {
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.header-title {
  flex: 1;
  min-width: 0;
}

.header-title h1 {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 6px 0;
  line-height: 1.3;
  letter-spacing: -0.5px;
}

.header-title p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.btn .icon {
  font-size: 18px;
}

.btn-outline {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.btn-outline:hover {
  border-color: var(--primary-color);
  background: var(--bg-secondary);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover {
  opacity: 0.95;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.5);
}

.btn-primary:active {
  transform: translateY(0);
}

/* ========== 工具栏 ========== */
.toolbar-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 16px 20px;
}

.toolbar-content {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: var(--primary-color);
  background: var(--bg-secondary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  font-size: 16px;
  opacity: 0.5;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  color: var(--text-primary);
  min-width: 0;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.clear-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 140px;
}

.filter-select {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}

.filter-select:hover {
  border-color: var(--text-tertiary);
}

.filter-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* ========== 统计卡片区 ========== */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
}

.stat-item {
  min-width: 0;
  width: 100%;
}

@media (max-width: 1200px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ========== 表格区域 ========== */
.table-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  width: 100%;
}

.table-container {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.data-table thead {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  border-bottom: 2px solid var(--primary-color);
}

.data-table th {
  padding: 16px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* SPU 行 - 卡片式外边框 */
.data-table .spu-row {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 10px;
  margin: 4px 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.data-table .spu-row:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
}

/* SKU 子行 */
.data-table .sku-row {
  background: var(--bg-hover);
  border-left: 3px solid var(--primary-color);
  margin: 0 8px;
}

.data-table .sku-row:hover {
  background: var(--bg-muted);
}

/* 圆角处理 */
.data-table .spu-row td:first-child {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.data-table .spu-row td:last-child {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

/* SKU 子行 */
.data-table .sku-row {
  background: var(--bg-hover);
  border-left: 3px solid var(--primary-color);
  margin: 0 16px;
}

.data-table .sku-row:hover {
  background: var(--bg-muted);
}

.data-table td {
  padding: 16px 12px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.data-table .spu-row td:first-child {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.data-table .spu-row td:last-child {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  border-right: none;
}

.data-table .sku-row td {
  border-bottom: none;
}

.data-table .sku-row:last-child td {
  border-bottom: 1px solid var(--border-color);
}

.col-product {
  max-width: none;
}

.product-info {
  max-width: 100%;
}

.product-name {
  word-break: break-word;
  max-width: 100%;
}

/* SPU 行 */
.spu-row {
  background: var(--bg-secondary);
  transition: background 0.2s ease;
}

.spu-row:hover {
  background: var(--bg-hover);
}

/* SKU 子行 */
.sku-row {
  background: var(--bg-hover);
  transition: background 0.2s ease;
}

.sku-row:hover {
  background: var(--bg-muted);
}

/* 展开按钮 */
.btn-expand {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.btn-expand:hover {
  background: var(--bg-hover);
  color: var(--primary-color);
}

/* 商品图片 */
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

/* 商品信息 */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9 !important;
  line-height: 1.3;
}

.product-category {
  font-size: 12px;
  color: #64748b !important;
}

/* 主货号 */
.part-number {
  font-size: 12px;
  color: #94a3b8 !important;
  font-family: monospace;
  background: #1e293b;
  padding: 4px 8px;
  border-radius: 4px;
}

/* 店铺名称 */
.shop-name {
  font-size: 12px;
  color: #e2e8f0 !important;
  background: #1e293b;
  padding: 4px 8px;
  border-radius: 4px;
}

/* SKCID */
.sku-cid {
  font-size: 11px;
  color: #fbbf24 !important;
  font-family: monospace;
  background: rgba(251, 191, 36, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
}

/* SKU 数量 */
.sku-count {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
}

/* 规格占位 */
.specs-placeholder {
  font-size: 14px;
  color: var(--text-tertiary);
}

/* SKU 名称 */
.sku-name {
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.sku-indent {
  color: var(--text-tertiary);
  font-weight: 300;
}

/* SKU 编码 */
.sku-code {
  font-size: 12px;
  color: var(--primary-color);
  font-family: 'Courier New', monospace;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
}

/* 规格徽章 */
.specs-badge {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 4px 10px;
  border-radius: 12px;
  display: inline-block;
}

/* 平台徽章 */
.platform-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  display: inline-block;
}

.platform-temu { background: rgba(245, 63, 63, 0.12); color: #f53f3f; }
.platform-ml { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
.platform-ml-ht { background: rgba(16, 185, 129, 0.12); color: #10b981; }
.platform-amz { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }

/* 库存 */
.stock-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.stock-warning {
  color: var(--warning-color);
}

.stock-onway {
  display: block;
  font-size: 10px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

/* 价格 */
.price-range {
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-min {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-color);
}

.price-sep {
  font-size: 12px;
  color: var(--text-tertiary);
}

.price-max {
  font-size: 12px;
  color: var(--text-tertiary);
}

.price-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
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

/* 操作按钮 */
.btn-action {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  opacity: 0.7;
  transition: all 0.2s;
}

.btn-action:hover {
  background: var(--bg-hover);
  opacity: 1;
}

.action-group {
  display: flex;
  gap: 4px;
}

.btn-action-sm {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
  transition: all 0.2s;
}

.btn-action-sm:hover {
  background: var(--bg-hover);
  opacity: 1;
}

/* ========== 响应式设计 ========== */

/* 平板 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 16px;
    gap: 16px;
  }
  
  .header-content {
    padding: 16px;
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .header-actions .btn {
    flex: 1;
  }
  
  .toolbar-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
  
  .filters {
    width: 100%;
  }
  
  .filter-item {
    flex: 1;
  }
  
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 手机 */
@media (max-width: 480px) {
  .content-wrapper {
    padding: 12px;
    gap: 12px;
  }
  
  .header-content {
    padding: 14px;
  }
  
  .header-title h1 {
    font-size: 18px;
  }
  
  .header-title p {
    font-size: 12px;
  }
  
  .btn {
    padding: 8px 14px;
    font-size: 12px;
  }
  
  .toolbar-section {
    padding: 14px;
  }
  
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .stat-card {
    padding: 14px !important;
  }
  
  .data-table th,
  .data-table td {
    padding: 12px 10px;
    font-size: 11px;
  }
  
  .product-thumb {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .product-name {
    font-size: 13px;
  }
  
  .product-category {
    font-size: 11px;
  }
}

/* ========== SKU 文件管理模态框 ========== */
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

/* ========== 现代化 UI 增强 ========== */
.stat-card-modern {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.stat-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stat-card-modern.success::before {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.stat-card-modern.warning::before {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.stat-card-modern.danger::before {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

/* 表格现代化 */
.table-modern thead {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  border-bottom: 2px solid var(--primary-color);
}

.table-modern th {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
}

.table-modern tbody tr:hover {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.04), rgba(139, 92, 246, 0.04));
  transform: scale(1.005);
}

/* 动画关键帧 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

/* ========== 深色主题覆盖 ========== */
.table-section .table-wrapper {
  background: #0f172a !important;
  border: 1px solid #1e293b !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

.data-table thead {
  background: #1e293b !important;
  border-bottom: 2px solid #334155 !important;
}

.data-table th {
  color: #94a3b8 !important;
}

.data-table tbody tr {
  background: #0f172a !important;
  border-bottom: 1px solid #1e293b !important;
}

.data-table tbody tr:hover {
  background: #1e293b !important;
}

.data-table td {
  color: #e2e8f0 !important;
}

.data-table .spu-row {
  background: #0f172a !important;
  border: none !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

.data-table .spu-row:hover {
  background: #1e293b !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

.data-table .sku-row {
  background: #0b1120 !important;
  border-left: 3px solid #60a5fa !important;
  margin: 0 !important;
}

.data-table .sku-row:hover {
  background: #1e293b !important;
}

.data-table .sku-row td {
  border-bottom: 1px solid #1e293b !important;
}

.product-thumb {
  background: #1e293b !important;
}

.product-name {
  color: #f1f5f9 !important;
}

.product-category {
  color: #64748b !important;
}

.sku-count {
  background: #1e293b !important;
  color: #94a3b8 !important;
}

.platform-temu { 
  background: rgba(239, 68, 68, 0.15) !important; 
  color: #f87171 !important;
  border-radius: 6px !important;
  border: 1px solid rgba(239, 68, 68, 0.3) !important;
}

.platform-ml { 
  background: rgba(59, 130, 246, 0.15) !important; 
  color: #60a5fa !important;
  border-radius: 6px !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
}

.platform-ml-ht { 
  background: rgba(16, 185, 129, 0.15) !important; 
  color: #34d399 !important;
  border-radius: 6px !important;
  border: 1px solid rgba(16, 185, 129, 0.3) !important;
}

.platform-amz { 
  background: rgba(245, 158, 11, 0.15) !important; 
  color: #fbbf24 !important;
  border-radius: 6px !important;
  border: 1px solid rgba(245, 158, 11, 0.3) !important;
}

.stock-value {
  color: #e2e8f0 !important;
}

.stock-onway {
  color: #34d399 !important;
  background: rgba(16, 185, 129, 0.1) !important;
  border-radius: 4px !important;
  padding: 2px 6px !important;
}

.price-min, .price-max {
  color: #34d399 !important;
}

.price-sep {
  color: #64748b !important;
}

.sku-name {
  color: #94a3b8 !important;
}

.sku-code {
  color: #60a5fa !important;
  background: rgba(96, 165, 250, 0.1) !important;
  border-radius: 4px !important;
}

.specs-badge {
  color: #94a3b8 !important;
  background: #1e293b !important;
  border-radius: 6px !important;
}

.price-usd {
  color: #34d399 !important;
}

.price-cny {
  color: #64748b !important;
}

.btn-action:hover {
  background: #334155 !important;
}

.btn-action-sm:hover {
  background: #334155 !important;
}

.btn-expand:hover {
  background: #1e293b !important;
  color: #60a5fa !important;
}

/* 主货号 */
.part-number {
  font-size: 12px;
  color: #94a3b8;
  font-family: monospace;
  background: #1e293b;
  padding: 4px 8px;
  border-radius: 4px;
}

/* SKCID */
.sku-cid {
  font-size: 11px;
  color: #fbbf24;
  font-family: monospace;
  background: rgba(251, 191, 36, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
}

/* SKU 规格显示 */
.sku-specs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.spec-label {
  color: #64748b;
  font-weight: 500;
}

.spec-value {
  color: #e2e8f0;
  font-weight: 600;
}

.spec-value.sku-id {
  color: #60a5fa;
  font-family: monospace;
  background: rgba(96, 165, 250, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

/* 供货价 */
.price-cost {
  font-size: 14px;
  font-weight: 700;
  color: #34d399;
}

/* 分页 */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #1e293b;
  border-radius: 12px;
  margin-top: 16px;
  border: 1px solid #334155;
}

.pagination-info {
  font-size: 13px;
  color: #94a3b8;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-btn {
  padding: 8px 16px;
  background: #334155;
  border: none;
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 13px;
  cursor: pointer;
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
  color: #f1f5f9;
  font-weight: 600;
  min-width: 100px;
  text-align: center;
}

/* SKU 子行样式固定 */
.data-table .sku-row {
  background: #0f172a !important;
}

.data-table .sku-row td {
  border-bottom: 1px solid #1e293b !important;
  padding: 16px 12px !important;
  vertical-align: middle !important;
}

.data-table .sku-row:hover {
  background: #1e293b !important;
}

/* 展开行样式固定 */
.data-table .spu-row.expanded {
  background: #0f172a !important;
  border-radius: 0 !important;
}

.data-table .spu-row.expanded:hover {
  background: #1e293b !important;
}

/* 表格行统一样式 */
.data-table tbody tr {
  border-radius: 0 !important;
}

.data-table tbody tr:hover {
  background: #1e293b !important;
}

/* 图片预览模态框 */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.image-preview-modal {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: #f1f5f9;
  font-size: 32px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.image-preview-close:hover {
  background: #334155;
  color: #fff;
}

/* ========== 编辑产品表单样式 ========== */
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
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f8fafc;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #1e293b;
}

.image-preview-content {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}
</style>
