<template>
  <div id="app">
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span>📦</span>
          <span>电商管理</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/products" class="nav-item">
          <span>📦</span>
          <span>商品管理</span>
        </router-link>
        <router-link to="/files" class="nav-item">
          <span>📁</span>
          <span>商品文件</span>
        </router-link>
        <router-link to="/purchase" class="nav-item">
          <span>📋</span>
          <span>采购管理</span>
        </router-link>
        <router-link to="/suppliers" class="nav-item">
          <span>🏭</span>
          <span>供应商管理</span>
        </router-link>
        <router-link to="/sales" class="nav-item">
          <span>📊</span>
          <span>销售记录</span>
        </router-link>
        <router-link to="/reports" class="nav-item">
          <span>📈</span>
          <span>数据报表</span>
        </router-link>
      </nav>
    </div>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

#app {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.sidebar {
  width: 240px;
  background: #1e293b;
  padding: 20px;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  width: 100%;
  min-width: 0;
}

.sidebar-header {
  margin-bottom: 30px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #94a3b8;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #334155;
  color: #f8fafc;
}

.nav-item.router-link-active {
  background: #3b82f6;
  color: white;
}

.main-content {
  flex: 1;
  min-height: 100vh;
}
</style>
