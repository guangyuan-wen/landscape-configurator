# 分享给他人使用 / 部署到公网

有两种方式让朋友或同事也能打开并上传文件：

---

## 方式一：同一 WiFi / 局域网内分享（无需公网）

适合：朋友和你在同一办公室或同一 WiFi 下。

### 1. 用“分享模式”启动

在项目目录运行：

```bash
npm run dev:share
```

### 2. 查看本机局域网地址

启动后终端会显示类似：

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

记下 **Network** 这一行的地址（你的电脑 IP 可能不同，以终端显示为准）。

### 3. 把地址发给朋友

让朋友在浏览器里打开 **Network 地址**，例如：

`http://192.168.1.100:5173/`

注意：

- 你的电脑需要**一直开着**并保持运行 `npm run dev:share`
- 朋友必须和你在**同一局域网**（同一 WiFi 或同一内网）
- 若要用「上传到 Google Drive」，需要在 Google Cloud 的 **OAuth 同意屏幕 → 测试用户** 里添加朋友的 Gmail；或在 **凭据 → 您的 OAuth 客户端 → 已授权的 JavaScript 源** 里添加 `http://你的IP:5173`（例如 `http://192.168.1.100:5173`）

---

## 方式二：部署到公网（任何人通过链接都能打开）

适合：想发一个链接给任何人（不同网络、不同地区）都能用。

### 推荐：用 Vercel 免费部署（几分钟搞定）

1. **注册并安装 Vercel**
   - 打开 [vercel.com](https://vercel.com)，用 GitHub 或邮箱注册
   - 安装 [Vercel CLI](https://vercel.com/docs/cli)：在终端运行 `npm i -g vercel`

2. **在项目里构建并部署**
   - 在项目根目录（`landscape-configurator`）打开终端，执行：
   ```bash
   npm run build
   vercel
   ```
   - 按提示登录、选择或创建项目，一路回车即可
   - 部署完成后会得到一个地址，例如：`https://landscape-configurator-xxx.vercel.app`

3. **配置 Google OAuth 允许该域名**
   - 打开 [Google Cloud Console](https://console.cloud.google.com/) → 您的项目
   - **API 和服务** → **凭据** → 点开您的 **OAuth 2.0 客户端 ID**
   - 在 **已授权的 JavaScript 源** 里添加一条：`https://landscape-configurator-xxx.vercel.app`（换成你实际得到的 Vercel 地址）
   - 保存

4. **配置环境变量（让 Vercel 知道你的 Google 客户端 ID）**
   - 在 Vercel 项目里：**Settings** → **Environment Variables**
   - 添加变量：名称 `VITE_GOOGLE_CLIENT_ID`，值填你的 Google 客户端 ID
   - 重新部署一次（Deployments → 最新一次 → 右侧 ⋮ → Redeploy）

5. **把链接发给别人**
   - 任何人打开 `https://你的项目.vercel.app` 即可使用
   - 上传到 Google Drive 时，每个使用者需要用**自己的 Google 账号**登录；若应用仍在“测试”模式，需在 OAuth 同意屏幕里把他们的 Gmail 加为**测试用户**

### 其他部署方式

- **Netlify**：把 `dist` 文件夹拖到 [netlify.com/drop](https://app.netlify.com/drop)，或连接 Git 自动部署
- **GitHub Pages**：用 `npm run build` 生成 `dist`，在仓库 Settings → Pages 里选择用 `dist` 部署

只要部署后的地址是 **https://某域名**，都要在 Google OAuth 的 **已授权的 JavaScript 源** 里加上这个完整地址（不要带路径，只到域名即可）。

---

## 小结

| 方式       | 谁可以访问           | 你的电脑要开机吗 | 需要改 Google 配置吗 |
|------------|----------------------|------------------|------------------------|
| 方式一 LAN | 同一 WiFi/局域网的人 | 是               | 建议加 IP 或只加测试用户 |
| 方式二 公网 | 任何人有链接即可     | 否               | 要加部署后的域名到 OAuth |

需要“别人也能上传到 Google Drive”时，记得在 Google Cloud 的 **OAuth 同意屏幕 → 测试用户** 里添加对方的 Gmail（测试模式下必须）。
