# 🚀 电商管理系统 - 快速部署指南

## ✅ 已完成
- [x] 前端构建完成（dist 文件夹）
- [x] Git 仓库初始化
- [x] 飞书应用已创建

---

## 📋 部署方式（3 选 1）

### 方式 1：Netlify Drop（最简单，推荐）⭐

1. **打开** https://app.netlify.com/drop
2. **拖拽** `dist` 文件夹到网页上
3. **获得访问地址**（如 `https://xxx-xxx.netlify.app`）
4. **填入飞书应用配置**

**优点**：无需账号，直接拖拽，30 秒完成

---

### 方式 2：Vercel（推荐用于生产）

1. **打开** https://vercel.com/new
2. **点击** "Import Git Repository"
3. **选择 GitHub 仓库** `banbieyewear-create/ecommerce-app`
4. **点击** "Deploy"
5. **等待部署完成**（约 1 分钟）
6. **获得访问地址**（如 `https://ecommerce-app.vercel.app`）

**或者手动上传**：
1. 在 GitHub 创建仓库 `ecommerce-app`
2. 上传 `dist` 文件夹内容
3. 在 Vercel 导入仓库

---

### 方式 3：飞书云托管（深度集成）

1. **打开** 飞书开发者后台 → 应用配置
2. **找到** "网页应用" 或 "业务网址"
3. **配置** 访问地址（需要自有服务器）
4. **上传** `dist` 文件夹到服务器

---

## 🎯 飞书应用配置

获得访问地址后：

1. **打开** 飞书开发者后台
2. **进入** 应用配置 → 网页应用
3. **填写**：
   - PC 端访问地址：`https://你的地址.vercel.app`
   - 移动端访问地址：同上
4. **保存**
5. **版本管理** → 创建版本 → 发布

---

## 📁 文件位置

- **构建文件**：`C:\Users\Administrator\.openclaw\workspace\feishu-ecommerce-app\frontend\dist`
- **部署说明**：本文件
- **Git 仓库**：`C:\Users\Administrator\.openclaw\workspace\feishu-ecommerce-app`

---

## 🔧 本地测试

```bash
cd C:\Users\Administrator\.openclaw\workspace\feishu-ecommerce-app\frontend
npm run dev
```

访问：http://localhost:3000

---

## 📞 需要帮助？

1. Netlify 部署问题 → 检查文件夹是否包含 index.html
2. Vercel 部署问题 → 检查 GitHub 仓库权限
3. 飞书配置问题 → 检查访问地址是否正确

---

**祝部署顺利！** 🎉
