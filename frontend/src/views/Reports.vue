<template>
  <div class="reports-page">
    <div class="content-wrapper">
      <!-- 页面头部 -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-title">
            <h1>📈 数据报表</h1>
            <p>查看商品销售和库存统计</p>
          </div>
        </div>
      </header>

      <!-- 统计卡片区 -->
      <section class="stats-section">
        <StatCard 
          icon="📦" 
          label="商品总数" 
          :value="totalProducts" 
          color="blue"
          class="stat-item"
        />
        <StatCard 
          icon="📊" 
          label="SKU 总数" 
          :value="totalSkus" 
          color="green"
          class="stat-item"
        />
        <StatCard 
          icon="💰" 
          label="库存总价值" 
          :value="totalStockValue" 
          color="purple"
          class="stat-item"
        />
      </section>

      <!-- 商品统计表格 -->
      <section class="table-section">
        <h2 class="section-title">📦 商品库存统计</h2>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>主货号</th>
                <th>商品名称</th>
                <th>规格数</th>
                <th>总库存</th>
                <th>成本价</th>
                <th>库存价值</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td>{{ product.mainPartNumber || product.id }}</td>
                <td>{{ product.name }}</td>
                <td>{{ product.skus.length }}</td>
                <td>{{ product.skus.reduce((sum, sku) => sum + sku.stock, 0) }}</td>
                <td>¥{{ avgCost(product) }}</td>
                <td>¥{{ stockValue(product).toLocaleString() }}</td>
              </tr>
              <tr v-if="products.length === 0">
                <td colspan="6" class="empty-state">
                  <span class="empty-icon">📦</span>
                  <p class="empty-text">暂无商品数据</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import StatCard from '../components/common/StatCard.vue'

export default {
  name: 'ReportsPage',
  components: {
    StatCard
  },
  data() {
    return {
      products: []
    }
  },
  mounted() {
    this.loadProducts()
  },
  computed: {
    totalProducts() {
      return this.products.length
    },
    totalSkus() {
      return this.products.reduce((sum, p) => sum + p.skus.length, 0)
    },
    totalStockValue() {
      return this.products.reduce((sum, p) => sum + this.stockValue(p), 0).toLocaleString()
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
    avgCost(product) {
      if (!product.skus || product.skus.length === 0) return 0
      const total = product.skus.reduce((sum, sku) => sum + sku.cost, 0)
      return (total / product.skus.length).toFixed(2)
    },
    stockValue(product) {
      return product.skus.reduce((sum, sku) => sum + (sku.stock * sku.cost), 0)
    }
  }
}
</script>

<style scoped>
.reports-page {
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

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  min-width: 180px;
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

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 16px 0;
}

.table-responsive {
  overflow: auto;
  width: 100%;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  color: #f8fafc;
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

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
}
</style>
