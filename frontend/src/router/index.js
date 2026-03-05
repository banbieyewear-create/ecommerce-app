import { createRouter, createWebHashHistory } from 'vue-router'
import ProductsPage from '../views/products/Index.vue'
import FilesPage from '../views/Files.vue'
import PurchasePage from '../views/Purchase.vue'
import SuppliersPage from '../views/Suppliers.vue'
import SalesPage from '../views/Sales.vue'
import ReportsPage from '../views/Reports.vue'

const routes = [
  { path: '/', redirect: '/products' },
  { path: '/products', name: 'Products', component: ProductsPage },
  { path: '/files', name: 'Files', component: FilesPage },
  { path: '/purchase', name: 'Purchase', component: PurchasePage },
  { path: '/suppliers', name: 'Suppliers', component: SuppliersPage },
  { path: '/sales', name: 'Sales', component: SalesPage },
  { path: '/reports', name: 'Reports', component: ReportsPage }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
