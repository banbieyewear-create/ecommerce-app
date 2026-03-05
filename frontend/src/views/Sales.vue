<template>
  <div class="sales-page">
    <div class="content-wrapper">
      <!-- 页面头部 -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-title">
            <h1>📊 销售记录</h1>
            <p>查看和管理销售订单数据</p>
          </div>
        </div>
      </header>

      <!-- 统计卡片区 -->
      <section class="stats-section">
        <StatCard 
          icon="📦" 
          label="总订单数" 
          :value="orders.length" 
          color="blue"
          class="stat-item"
        />
        <StatCard 
          icon="💰" 
          label="销售总额" 
          :value="totalAmount" 
          color="green"
          class="stat-item"
        />
        <StatCard 
          icon="📈" 
          label="总利润" 
          :value="totalProfit" 
          color="purple"
          class="stat-item"
        />
      </section>

      <!-- 数据表格 -->
      <section class="table-section">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>主货号</th>
                <th>规格</th>
                <th>数量</th>
                <th>单价</th>
                <th>总额</th>
                <th>利润</th>
                <th>日期</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td>{{ order.orderNo }}</td>
                <td>{{ order.partNumber }}</td>
                <td>{{ order.specs }}</td>
                <td>{{ order.quantity }}</td>
                <td>¥{{ order.price }}</td>
                <td>¥{{ (order.quantity * order.price).toLocaleString() }}</td>
                <td>¥{{ ((order.price - order.cost) * order.quantity).toLocaleString() }}</td>
                <td>{{ order.date }}</td>
              </tr>
              <tr v-if="orders.length === 0">
                <td colspan="8" class="empty-state">
                  <span class="empty-icon">📊</span>
                  <p class="empty-text">暂无销售记录</p>
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
  name: 'SalesPage',
  components: {
    StatCard
  },
  data() {
    return {
      orders: []
    }
  },
  mounted() {
    this.loadOrders()
  },
  computed: {
    totalAmount() {
      return this.orders.reduce((sum, o) => sum + (o.quantity * o.price), 0).toLocaleString()
    },
    totalProfit() {
      return this.orders.reduce((sum, o) => sum + ((o.price - o.cost) * o.quantity), 0).toLocaleString()
    }
  },
  methods: {
    loadOrders() {
      // 从 localStorage 加载销售数据
      const sales = localStorage.getItem('ecommerce-sales')
      if (sales) {
        try {
          this.orders = JSON.parse(sales)
        } catch (e) {
          console.error('加载销售数据失败:', e)
          this.orders = []
        }
      }
    }
  }
}
</script>

<style scoped>
.sales-page {
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
