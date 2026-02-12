# Landscape Configurator Pro v0.5.1

一个功能强大的景观配置工具，支持拖放式设计、成本计算和数据分析。

## 功能特性

- 🎨 **拖放式设计界面** - 直观的可视化设计工具
- 💰 **市场调整定价** - 基于新加坡市场的真实成本
- 📊 **同步预算** - 侧边栏显示 USD/SGD 以匹配分析 HUD
- 🌿 **有机曲线引擎** - 平滑样条插值实现自然形状
- 🔧 **顶点操作** - 支持不规则多边形（草地/水体）

## 安装步骤

### 1. 安装 Node.js

如果您的系统还没有安装 Node.js，请先安装：

- 访问 [Node.js 官网](https://nodejs.org/)
- 下载并安装 LTS 版本（推荐 18.x 或更高版本）
- 安装完成后，重启终端/命令提示符

### 2. 安装项目依赖

打开终端/命令提示符，进入项目目录：

```bash
cd C:\Users\Wayne\landscape-configurator
```

然后运行：

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

服务器启动后，您会看到类似以下的输出：

```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

在浏览器中打开 `http://localhost:5173/` 即可使用应用。

### 让同局域网的朋友也能打开

运行 `npm run dev:share`，终端会显示 **Network** 地址（如 `http://192.168.x.x:5173/`），把该地址发给同一 WiFi 下的朋友即可。详见 [DEPLOY_AND_SHARE.md](./DEPLOY_AND_SHARE.md)。

### 部署到公网（任何人通过链接访问）

可部署到 Vercel / Netlify 等，获得一个公网链接。步骤见 [DEPLOY_AND_SHARE.md](./DEPLOY_AND_SHARE.md)。

## 使用方法

1. **加载底图**：点击侧边栏的 "Load Site Plan" 按钮上传场地平面图
2. **添加元素**：从侧边栏拖放植被、水体、基础设施等到画布上
3. **编辑元素**：点击元素进行选择，然后调整位置、大小、旋转等属性
4. **查看数据**：切换到 "Costing/Technical Data" 视图查看成本和技术数据
5. **导出配置**：点击 "JSON Export" 按钮导出配置数据

## 项目结构

```
landscape-configurator/
├── src/
│   ├── App.jsx          # 主应用组件
│   ├── main.jsx         # React 入口文件
│   └── index.css        # 全局样式
├── index.html           # HTML 模板
├── package.json         # 项目配置和依赖
├── vite.config.js       # Vite 构建配置
├── tailwind.config.js   # Tailwind CSS 配置
└── postcss.config.js    # PostCSS 配置
```

## 技术栈

- **React 18** - UI 框架
- **Vite** - 构建工具和开发服务器
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库

## 构建生产版本

```bash
npm run build
```

构建完成后，文件将输出到 `dist` 目录。

## 预览生产版本

```bash
npm run preview
```

## 注意事项

- 确保 Node.js 版本 >= 16.0.0
- 首次安装依赖可能需要几分钟时间
- 如果遇到端口占用问题，Vite 会自动选择其他端口
