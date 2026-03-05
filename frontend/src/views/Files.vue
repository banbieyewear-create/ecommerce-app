<template>
  <div class="files-page">
    <div class="content-wrapper">
      <!-- 页面头部 -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-title">
            <h1>📁 商品文件</h1>
            <p>管理所有 SKU 的商品文件和厂图，支持图片、文档、视频等所有格式</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" @click="exportFiles">
              <span class="icon">📥</span>
              <span class="text">导出</span>
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
              placeholder="搜索商品名称、SKU、文件名..."
              class="search-input"
            />
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
              <select v-model="filterFileType" class="filter-select">
                <option value="">全部类型</option>
                <option value="image">图片</option>
                <option value="document">文档</option>
                <option value="video">视频</option>
                <option value="archive">压缩包</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- 数据表格 -->
      <section class="table-section">
        <div class="table-container">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col-expand" style="width: 40px;"></th>
                  <th class="col-image" style="width: 60px;">主图</th>
                  <th class="col-partnumber" style="width: 12%;">主货号</th>
                  <th class="col-specs" style="width: 12%;">规格</th>
                  <th class="col-platformsku" style="width: 15%;">平台 SKU</th>
                  <th class="col-files" style="width: 12%;">文件</th>
                  <th class="col-factory" style="width: 12%;">厂图</th>
                  <th class="col-actions" style="width: 100px;">操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="spu in paginatedSpus" :key="spu.id">
                  <!-- SPU 行 -->
                  <tr class="spu-row" :class="{ 'expanded': expandedRows.includes(spu.id) }">
                    <td class="col-expand">
                      <button class="btn-expand" @click="toggleExpand(spu.id)">
                        {{ expandedRows.includes(spu.id) ? '▼' : '▶' }}
                      </button>
                    </td>
                    <td class="col-image">
                      <div class="product-thumb-small" @click="showImagePreview(spu)" style="cursor: pointer;">
                        <img v-if="spu.materials" :src="spu.materials" :alt="spu.name" style="width: 100%; height: 100%; object-fit: cover;" />
                        <span v-else>📦</span>
                      </div>
                    </td>
                    <td class="col-partnumber">
                      <span class="part-number">{{ spu.mainPartNumber || '-' }}</span>
                    </td>
                    <td class="col-specs">
                      <span class="specs-text">{{ spu.skus.length }} 个规格</span>
                    </td>
                    <td class="col-platformsku">
                      <span class="platform-sku-multi">
                        {{ spu.skus.length }} 个规格
                      </span>
                    </td>
                    <td class="col-files">
                      <span v-if="hasFiles(spu)" class="file-status uploaded" @click="openFirstFile(spu)" style="cursor: pointer;">✅ 已上传</span>
                      <span v-else class="file-status">📎 未上传</span>
                    </td>
                    <td class="col-factory">
                      <span v-if="hasFactoryImages(spu)" class="factory-status uploaded" @click="openFirstFactoryImage(spu)" style="cursor: pointer;">✅ 已上传</span>
                      <span v-else class="factory-status">📎 未上传</span>
                    </td>
                    <td class="col-actions">
                      <button class="btn-action" @click="toggleExpand(spu.id)" title="展开/收起">
                        <span>➕</span>
                      </button>
                    </td>
                  </tr>
                  <!-- SKU 子行 -->
                  <tr v-if="expandedRows.includes(spu.id)" v-for="sku in spu.skus" :key="sku.id" class="sku-row">
                    <td class="col-expand"></td>
                    <td class="col-image"></td>
                    <td class="col-partnumber"></td>
                    <td class="col-specs">
                      <span class="specs-text">{{ sku.specs }}</span>
                    </td>
                    <td class="col-platformsku">
                      <input 
                        type="text" 
                        v-model="sku.platformSku" 
                        class="platform-sku-input"
                        placeholder="输入平台 SKU"
                        @change="savePlatformSku(spu, sku)"
                      />
                    </td>
                    <td class="col-files">
                      <span v-if="sku.files && sku.files.length > 0" class="file-status uploaded" @click="previewFirstFile(sku)" style="cursor: pointer;">✅ 已上传 ({{ sku.files.length }})</span>
                      <span v-else class="file-status">📎 未上传</span>
                    </td>
                    <td class="col-factory">
                      <button v-if="sku.factoryImages && sku.factoryImages.length > 0" class="btn-factory-delete" @click="deleteFactoryImages(sku)" title="删除厂图">
                        <span>🗑️ 删除厂图</span>
                      </button>
                      <span v-else class="factory-status">📎 未上传</span>
                    </td>
                    <td class="col-actions">
                      <button class="btn-action-sm" @click="openFileModal(spu, sku)" title="管理文件">
                        <span>📁</span>
                      </button>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- 分页 -->
      <div class="pagination-section">
        <div class="pagination-info">
          显示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredSpus.length) }} 条，共 {{ filteredSpus.length }} 条
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
          <h3 class="modal-title">📁 SKU 文件管理</h3>
          <button class="modal-close" @click="closeFileModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="sku-info-bar" v-if="currentSku">
            <span class="sku-label">当前 SKU:</span>
            <span class="sku-badge">{{ currentSpu?.name }}</span>
            <span class="sku-code-badge">{{ currentSku.sku }}</span>
            <span class="specs-badge-sm">{{ currentSku.specs }}</span>
          </div>

          <!-- 厂图上传区域 -->
          <div class="upload-section">
            <h4 class="upload-title">🏭 厂图上传</h4>
            <div class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
              <label class="upload-btn">
                <input type="file" multiple accept="image/*" @change="handleFactoryImages" style="display: none" />
                <span class="upload-icon">🏭</span>
                <span class="upload-text">点击或拖拽上传厂图</span>
                <span class="upload-hint">支持 JPG、PNG、WEBP 格式</span>
              </label>
            </div>
            <!-- 厂图预览 -->
            <div v-if="currentSku?.factoryImages?.length > 0" class="factory-preview">
              <div v-for="(img, index) in currentSku.factoryImages" :key="index" class="factory-image-item">
                <img :src="img.url" :alt="img.name" class="factory-image-thumb" />
                <button class="remove-image" @click="removeFactoryImage(index)">✕</button>
              </div>
            </div>
          </div>

          <!-- 文件上传区域 -->
          <div class="upload-section">
            <h4 class="upload-title">📎 SKU 文件上传</h4>
            <div class="upload-area">
              <label class="upload-btn">
                <input type="file" multiple @change="uploadFiles" style="display: none" />
                <span class="upload-icon">📤</span>
                <span class="upload-text">点击或拖拽上传文件</span>
                <span class="upload-hint">支持图片、文档、视频、压缩包等所有格式</span>
              </label>
            </div>
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
                <div class="file-icon" @click="previewFileInModal(file)" style="cursor: pointer;" :title="file.name">{{ getFileIcon(file.type) }}</div>
                <div class="file-info">
                  <div class="file-name" @click="previewFileInModal(file)" style="cursor: pointer;">{{ file.name }}</div>
                  <div class="file-meta">
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    <span class="file-time">{{ file.uploadTime }}</span>
                  </div>
                </div>
                <div class="file-actions">
                  <button class="btn-file-action" @click="previewFileInModal(file)" title="预览">👁️</button>
                  <button class="btn-file-action" @click="downloadFile(file)" title="下载">⬇️</button>
                  <button class="btn-file-action" @click="deleteFile(file.id)" title="删除">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <div v-if="previewImage" class="image-preview-overlay" @click="closeImagePreview">
      <div class="image-preview-modal" @click.stop>
        <button class="image-preview-close" @click="closeImagePreview">✕</button>
        <img :src="previewImage" alt="商品图片" class="image-preview-content" />
      </div>
    </div>

    <!-- 文件预览模态框 -->
    <div v-if="previewFile" class="file-preview-overlay" @click="closeFilePreview">
      <div class="file-preview-modal" @click.stop>
        <div class="file-preview-header">
          <h3 class="file-preview-title">{{ previewFile.name }}</h3>
          <button class="file-preview-close" @click="closeFilePreview">✕</button>
        </div>
        <div class="file-preview-content">
          <!-- 图片 -->
          <img v-if="isImage(previewFile.type)" :src="previewFile.url" alt="文件预览" class="preview-image" />
          <!-- PDF -->
          <iframe v-else-if="previewFile.type === 'application/pdf'" :src="previewFile.url" class="preview-pdf"></iframe>
          <!-- 视频 -->
          <video v-else-if="previewFile.type.startsWith('video/')" :src="previewFile.url" controls class="preview-video"></video>
          <!-- PSD/其他文件 -->
          <div v-else class="preview-unsupported">
            <div class="unsupported-icon">📄</div>
            <p class="unsupported-text">该格式不支持在线预览</p>
            <p class="unsupported-hint">{{ previewFile.type }} 格式文件</p>
            <button class="btn-download" @click="downloadFile(previewFile)">⬇️ 下载文件</button>
            <p class="psd-hint" v-if="previewFile.type.includes('photoshop') || previewFile.name.endsWith('.psd')">
              💡 PSD 文件建议使用 Adobe Photoshop 打开
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StatCard from '../components/common/StatCard.vue'

export default {
  name: 'Files',
  components: {
    StatCard
  },
  data() {
    return {
      searchKeyword: '',
      filterPlatform: '',
      filterFileType: '',
      showFileModal: false,
      previewImage: null,
      previewFile: null,
      currentSpu: null,
      currentSku: null,
      expandedRows: [],
      currentPage: 1,
      pageSize: 20,
      // 共享商品管理页面的数据
      spus: []
    }
  },
  mounted() {
    // 从 localStorage 读取商品数据
    this.loadProducts()
    // 监听数据变化
    window.addEventListener('products-updated', this.loadProducts)
  },
  beforeDestroy() {
    window.removeEventListener('products-updated', this.loadProducts)
  },
  computed: {
    filteredSpus() {
      return this.spus.filter(spu => {
        const matchSearch = !this.searchKeyword || 
          spu.name.includes(this.searchKeyword) || 
          spu.mainPartNumber?.includes(this.searchKeyword) ||
          spu.skus.some(k => k.sku.includes(this.searchKeyword) || k.files?.some(f => f.name.includes(this.searchKeyword)))
        const matchPlatform = !this.filterPlatform || 
          spu.shopName === this.filterPlatform ||
          spu.skus.some(sku => sku.platformSku === this.filterPlatform)
        return matchSearch && matchPlatform
      })
    },
    paginatedSpus() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredSpus.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredSpus.length / this.pageSize)
    }
  },
  methods: {
    loadProducts() {
      const products = localStorage.getItem('ecommerce-products')
      if (products) {
        try {
          this.spus = JSON.parse(products)
        } catch (e) {
          console.error('加载产品数据失败:', e)
          this.spus = []
        }
      }
    },
    saveProducts() {
      localStorage.setItem('ecommerce-products', JSON.stringify(this.spus))
      // 通知商品管理页面数据已更新
      window.dispatchEvent(new CustomEvent('products-updated'))
    },
    toggleExpand(spuId) {
      const index = this.expandedRows.indexOf(spuId)
      if (index > -1) {
        this.expandedRows.splice(index, 1)
      } else {
        this.expandedRows.push(spuId)
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    openFileModal(spu, sku) {
      this.currentSpu = spu
      this.currentSku = sku
      this.showFileModal = true
    },
    closeFileModal() {
      this.saveProducts()
      this.showFileModal = false
      this.currentSpu = null
      this.currentSku = null
    },
    // 将文件转换为 Base64
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },
    async uploadFiles(event) {
      const files = event.target.files
      if (!files || files.length === 0) return
      if (!this.currentSku) return
      
      let uploadedCount = 0
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          // 限制文件大小（最大 5MB）
          if (file.size > 5 * 1024 * 1024) {
            alert(`文件 "${file.name}" 超过 5MB，已跳过`)
            continue
          }
          const base64Url = await this.fileToBase64(file)
          if (!this.currentSku.files) {
            this.currentSku.files = []
          }
          this.currentSku.files.push({
            id: Date.now() + i,
            name: file.name,
            size: file.size,
            type: file.type,
            url: base64Url,
            uploadTime: new Date().toLocaleString('zh-CN')
          })
          uploadedCount++
        } catch (error) {
          console.error('文件上传失败:', error)
          alert(`文件 "${file.name}" 上传失败`)
        }
      }
      if (uploadedCount > 0) {
        alert(`已成功上传 ${uploadedCount} 个文件到 SKU "${this.currentSku.sku}"`)
      }
      event.target.value = ''
    },
    async handleFactoryImages(event) {
      const files = event.target.files
      if (!files || files.length === 0) return
      if (!this.currentSku) return
      
      if (!this.currentSku.factoryImages) {
        this.currentSku.factoryImages = []
      }
      
      let uploadedCount = 0
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) {
          alert('厂图只支持图片格式（JPG、PNG、WEBP）')
          continue
        }
        // 限制图片大小（最大 3MB）
        if (file.size > 3 * 1024 * 1024) {
          alert(`图片 "${file.name}" 超过 3MB，已跳过`)
          continue
        }
        try {
          const base64Url = await this.fileToBase64(file)
          this.currentSku.factoryImages.push({
            name: file.name,
            size: file.size,
            url: base64Url,
            uploadTime: new Date().toLocaleString('zh-CN')
          })
          uploadedCount++
        } catch (error) {
          console.error('厂图上传失败:', error)
          alert(`图片 "${file.name}" 上传失败`)
        }
      }
      if (uploadedCount > 0) {
        alert(`已成功上传 ${uploadedCount} 张厂图`)
      }
      event.target.value = ''
    },
    async handleDrop(event) {
      const files = event.dataTransfer.files
      if (!files || files.length === 0) return
      if (!this.currentSku) return
      
      if (!this.currentSku.factoryImages) {
        this.currentSku.factoryImages = []
      }
      
      let uploadedCount = 0
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue
        // 限制图片大小（最大 3MB）
        if (file.size > 3 * 1024 * 1024) {
          alert(`图片 "${file.name}" 超过 3MB，已跳过`)
          continue
        }
        try {
          const base64Url = await this.fileToBase64(file)
          this.currentSku.factoryImages.push({
            name: file.name,
            size: file.size,
            url: base64Url,
            uploadTime: new Date().toLocaleString('zh-CN')
          })
          uploadedCount++
        } catch (error) {
          console.error('厂图上传失败:', error)
        }
      }
      if (uploadedCount > 0) {
        alert(`已成功上传 ${uploadedCount} 张厂图`)
      }
    },
    removeFactoryImage(index) {
      if (confirm('确定删除这张厂图吗？')) {
        this.currentSku.factoryImages.splice(index, 1)
      }
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
    showImagePreview(spu) {
      if (spu.materials) {
        this.previewImage = spu.materials
      }
    },
    closeImagePreview() {
      this.previewImage = null
    },
    openFirstFile(spu) {
      // 找到第一个有文件的 SKU
      const skuWithFiles = spu.skus.find(s => s.files && s.files.length > 0)
      if (skuWithFiles && skuWithFiles.files.length > 0) {
        this.previewFirstFile(skuWithFiles)
      }
    },
    openFirstFactoryImage(spu) {
      // 找到第一个有厂图的 SKU
      const skuWithFactoryImages = spu.skus.find(s => s.factoryImages && s.factoryImages.length > 0)
      if (skuWithFactoryImages && skuWithFactoryImages.factoryImages.length > 0) {
        this.previewFileInModal(skuWithFactoryImages.factoryImages[0])
      }
    },
    previewFirstFile(sku) {
      if (sku.files && sku.files.length > 0) {
        this.previewFileInModal(sku.files[0])
      }
    },
    hasFiles(spu) {
      return spu.skus.some(s => s.files && s.files.length > 0)
    },
    hasFactoryImages(spu) {
      return spu.skus.some(s => s.factoryImages && s.factoryImages.length > 0)
    },
    savePlatformSku(spu, sku) {
      // 保存到 localStorage
      localStorage.setItem('ecommerce-products', JSON.stringify(this.spus))
      window.dispatchEvent(new CustomEvent('products-updated'))
    },
    displayPlatformSku(spu) {
      // 显示所有 SKU 的平台 SKU，如果超过 3 个则显示省略号
      const skus = spu.skus.filter(s => s.platformSku || s.sku)
      if (skus.length === 0) return '-'
      if (skus.length <= 3) {
        return skus.map(s => s.platformSku || s.sku).join(', ')
      }
      return `${skus.slice(0, 3).map(s => s.platformSku || s.sku).join(', ')} ... (+${skus.length - 3})`
    },
    allPlatformSkus(spu) {
      // 返回所有平台 SKU 用于 title 提示
      return spu.skus.map(s => s.platformSku || s.sku).join('\n')
    },
    deleteFactoryImages(sku) {
      if (confirm(`确定删除该 SKU 的所有 ${sku.factoryImages?.length || 0} 张厂图吗？`)) {
        sku.factoryImages = []
        this.saveProducts()
      }
    },
    previewFileInModal(file) {
      this.previewFile = file
    },
    closeFilePreview() {
      this.previewFile = null
    },
    isImage(type) {
      return type?.startsWith('image/') && !type?.includes('photoshop')
    },
    exportFiles() {
      alert('导出功能开发中...')
    }
  }
}
</script>

<style scoped>
/* 使用与商品管理页面相同的样式 */
.files-page {
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow: auto;
  background: #0f172a;
}

.content-wrapper {
  width: 100%;
  max-width: 100%;
  padding: 0;
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
  flex-wrap: wrap;
}

.header-title {
  flex: 1;
  min-width: 0;
}

.header-title h1 {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.header-title p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
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
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn .icon {
  font-size: 16px;
}

.btn-outline {
  background: #1e293b;
  color: #f1f5f9;
  border: 1px solid #334155;
}

.btn-outline:hover {
  background: #1e293b;
  border-color: #60a5fa;
}

/* 工具栏 */
.toolbar-section {
  background: #1e293b;
  border-radius: 12px;
  border: 1px solid #334155;
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
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.search-icon {
  font-size: 16px;
  color: #64748b;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  color: #f1f5f9;
  min-width: 0;
}

.search-input::placeholder {
  color: #64748b;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-item {
  position: relative;
}

.filter-select {
  padding: 10px 14px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  font-size: 13px;
  color: #f1f5f9;
  outline: none;
  cursor: pointer;
  appearance: none;
  padding-right: 32px;
}

.filter-select:focus {
  border-color: #60a5fa;
}

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card-modern {
  background: #1e293b;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  border: 1px solid #334155;
  transition: all 0.3s;
}

.stat-card-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.stat-card-modern.success::before {
  background: linear-gradient(90deg, #34d399, #10b981);
}

.stat-card-modern.primary::before {
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
}

.stat-card-modern.warning::before {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.stat-card-modern.danger::before {
  background: linear-gradient(90deg, #f87171, #ef4444);
}

.stat-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 表格 */
.table-section {
  width: 100%;
}

.table-container {
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #334155;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.data-table thead {
  background: #1e293b;
  border-bottom: 2px solid #334155;
}

.data-table th {
  padding: 14px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.data-table tbody tr {
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  transition: all 0.2s ease;
}

.data-table tbody tr:hover {
  background: #1e293b;
}

.data-table td {
  padding: 16px 12px;
  color: #e2e8f0;
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
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: #1e293b;
  border-radius: 24px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  border: 1px solid #334155;
  animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #334155;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.05), rgba(59, 130, 246, 0.05));
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.5px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #94a3b8;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-close:hover {
  background: #334155;
  color: #f1f5f9;
  transform: rotate(90deg);
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
  background: #0f172a;
  border-radius: 10px;
  flex-wrap: wrap;
}

.sku-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.sku-badge {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
}

.sku-code-badge {
  font-size: 12px;
  color: #60a5fa;
  font-family: monospace;
  background: rgba(96, 165, 250, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.specs-badge-sm {
  font-size: 11px;
  color: #94a3b8;
  background: #1e293b;
  padding: 4px 10px;
  border-radius: 12px;
}

/* 厂图上传 */
.upload-section {
  margin-bottom: 16px;
}

.upload-title {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 12px 0;
}

.upload-area {
  border: 2px dashed #334155;
  border-radius: 16px;
  padding: 30px 20px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.02), rgba(59, 130, 246, 0.02));
}

.upload-area:hover {
  border-color: #60a5fa;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.08), rgba(59, 130, 246, 0.08));
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(96, 165, 250, 0.15);
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  width: 100%;
}

.upload-icon {
  font-size: 48px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-area:hover .upload-icon {
  transform: translateY(-4px) scale(1.1);
}

.upload-text {
  font-size: 15px;
  color: #f1f5f9;
  font-weight: 600;
}

.upload-hint {
  font-size: 12px;
  color: #64748b;
}

/* 厂图预览 */
.factory-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.factory-image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #0f172a;
}

.factory-image-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.factory-image-item:hover .remove-image {
  opacity: 1;
}

/* 文件列表 */
.file-list-section {
  flex: 1;
}

.file-list-header {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #334155;
}

.file-count {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.03), rgba(59, 130, 246, 0.03));
  border-radius: 16px;
  border: 2px dashed #334155;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.4;
  animation: pulse 2s ease-in-out infinite;
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
  padding: 14px 16px;
  background: #0f172a;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.file-item:hover {
  background: #1e293b;
  border-color: #60a5fa;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.1);
}

.file-item .file-icon {
  font-size: 28px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(59, 130, 246, 0.1));
  border-radius: 10px;
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
  font-size: 14px;
  color: #f1f5f9;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #64748b;
}

.file-size {
  font-family: monospace;
  background: #1e293b;
  padding: 2px 6px;
  border-radius: 4px;
}

.file-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btn-file-action {
  background: #1e293b;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.8;
}

.btn-file-action:hover {
  background: #60a5fa;
  color: white;
  opacity: 1;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}

/* 图片预览 */
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

.image-preview-content {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

/* 主图 - 小尺寸 */
.product-thumb-small {
  width: 40px;
  height: 40px;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border-radius: 6px;
  overflow: hidden;
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

/* 平台 SKU */
.platform-sku-input {
  width: 100%;
  min-width: 120px;
  padding: 6px 10px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #f8fafc;
  font-size: 13px;
  font-family: monospace;
  transition: all 0.2s;
}

.platform-sku-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.platform-sku-input:hover {
  border-color: #475569;
}

.platform-sku-multi {
  font-size: 11px;
  color: #93c5fd;
  font-family: monospace;
  background: rgba(96, 165, 250, 0.08);
  padding: 4px 6px;
  border-radius: 4px;
  line-height: 1.4;
  max-width: 200px;
  display: inline-block;
  white-space: normal;
  word-break: break-all;
}

/* 规格 */
.specs-text {
  font-size: 13px;
  color: #e2e8f0;
}

/* 文件预览模态框 */
.file-preview-overlay {
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

.file-preview-modal {
  background: #1e293b;
  border-radius: 16px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
  border: 1px solid #334155;
  overflow: hidden;
}

.file-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #334155;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.05), rgba(59, 130, 246, 0.05));
}

.file-preview-title {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.file-preview-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #94a3b8;
  transition: all 0.2s;
}

.file-preview-close:hover {
  background: #334155;
  color: #f1f5f9;
}

.file-preview-content {
  padding: 24px;
  overflow: auto;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

.preview-pdf {
  width: 100%;
  height: 80vh;
  border: none;
}

.preview-video {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 8px;
}

.preview-unsupported {
  text-align: center;
  padding: 40px 20px;
}

.unsupported-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.unsupported-text {
  font-size: 18px;
  color: #f1f5f9;
  margin: 0 0 8px 0;
}

.unsupported-hint {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
}

.btn-download {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.btn-download:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(96, 165, 250, 0.3);
}

.psd-hint {
  font-size: 13px;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  margin: 0;
  display: inline-block;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
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
</style>
