<template>
  <div class="product-table-wrapper">
    <table class="product-table">
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
        <template v-for="spu in spus" :key="spu.id">
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
              <div class="product-info">
                <div class="product-name">{{ spu.name }}</div>
                <div class="product-category">{{ spu.category }}</div>
              </div>
            </td>
            <td>
              <span class="sku-count">{{ spu.skus.length }} 个 SKU</span>
            </td>
            <td>-</td>
            <td>
              <span :class="['badge', 'platform-' + getPlatformKey(spu.platform)]">
                {{ spu.platform }}
              </span>
            </td>
            <td>{{ spu.skus.reduce((sum, sku) => sum + sku.stock, 0) }}</td>
            <td>
              <span class="price-value">${{ minPrice(spu) }}</span>
              <span v-if="spu.skus.length > 1" class="price-range">-${{ maxPrice(spu) }}</span>
            </td>
            <td>
              <button class="btn-action" @click="$emit('add-sku', spu)" title="添加 SKU">➕</button>
            </td>
          </tr>
          <!-- SKU 子行 -->
          <tr v-if="expandedRows.includes(spu.id)" v-for="sku in spu.skus" :key="sku.id" class="sku-row">
            <td></td>
            <td></td>
            <td>
              <div class="sku-name">└─ {{ spu.name }}</div>
            </td>
            <td>
              <span class="sku-code">{{ sku.sku }}</span>
            </td>
            <td>
              <span class="specs-badge">{{ sku.specs }}</span>
            </td>
            <td></td>
            <td>
              <span :class="{ 'text-warning': sku.stock < 50 }">{{ sku.stock }}</span>
              <span v-if="sku.stockOnWay > 0" class="stock-onway">+{{ sku.stockOnWay }}</span>
            </td>
            <td>
              <div class="price-info">
                <div class="price-usd">${{ sku.price }}</div>
                <div class="price-cny">¥{{ sku.cost }}</div>
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-action-sm" @click="$emit('edit-sku', spu, sku)" title="编辑">✏️</button>
                <button class="btn-action-sm" @click="$emit('delete-sku', spu, sku)" title="删除">🗑️</button>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ProductTable',
  props: {
    spus: { type: Array, required: true },
    expandedRows: { type: Array, default: () => [] }
  },
  emits: ['expand', 'collapse', 'add-sku', 'edit-sku', 'delete-sku'],
  methods: {
    toggleExpand(spuId) {
      const index = this.expandedRows.indexOf(spuId)
      if (index > -1) {
        this.$emit('collapse', spuId)
      } else {
        this.$emit('expand', spuId)
      }
    },
    getPlatformKey(platform) {
      const map = { 'Temu': 'temu', '美客多 FTI': 'ml', '美客多半托管': 'ml-ht', '亚马逊': 'amz' }
      return map[platform] || ''
    },
    minPrice(spu) {
      return Math.min(...spu.skus.map(s => s.price))
    },
    maxPrice(spu) {
      return Math.max(...spu.skus.map(s => s.price))
    }
  }
}
</script>

<style scoped>
.product-table-wrapper {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: auto;
  border: 1px solid var(--border-color);
  width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

.product-table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
}

.product-table thead {
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-color);
}

.product-table th {
  padding: clamp(10px, 2vw, 12px) clamp(12px, 2.5vw, 16px);
  text-align: left;
  font-size: clamp(11px, 2.5vw, 12px);
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}

.product-table td {
  padding: clamp(12px, 2.5vw, 14px) clamp(12px, 2.5vw, 16px);
  border-bottom: 1px solid var(--border-color);
}

/* 响应式表格 */
@media (max-width: 768px) {
  .product-table th,
  .product-table td {
    padding: 10px 12px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .product-table th,
  .product-table td {
    padding: 8px 10px;
    font-size: 10px;
  }
  
  .product-thumb {
    width: 36px !important;
    height: 36px !important;
    font-size: 18px !important;
  }
  
  .product-name {
    font-size: 12px !important;
  }
  
  .product-category {
    font-size: 10px !important;
  }
  
  .sku-count,
  .sku-code,
  .specs-badge {
    font-size: 10px !important;
    padding: 3px 6px !important;
  }
  
  .badge {
    font-size: 9px !important;
    padding: 3px 8px !important;
  }
  
  .price-value {
    font-size: 11px !important;
  }
  
  .price-usd {
    font-size: 11px !important;
  }
  
  .btn-action,
  .btn-action-sm {
    font-size: 14px !important;
    padding: 3px !important;
  }
}

.spu-row {
  background: var(--bg-secondary);
  transition: background 0.2s;
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
  transition: all 0.2s;
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

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
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
  margin-left: 4px;
}

.price-info {
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
  transition: all 0.2s;
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
  transition: all 0.2s;
}

.btn-action-sm:hover {
  background: var(--bg-hover);
  opacity: 1;
}

.text-warning {
  color: var(--warning-color);
}
</style>
