# Vercel 公网部署详细步骤（一步步跟着做）

部署后**可以随时更改**：改完代码推送到 GitHub，Vercel 会自动重新部署，**同一个链接**会变成最新版本。不是“部署一次就锁死”。

---

## 一、先把项目放到 GitHub（若你还没做过）

### 1.1 注册 / 登录 GitHub

1. 打开浏览器，访问：**https://github.com**
2. 若没有账号：点右上角 **Sign up** 注册；若有：点 **Sign in** 登录。

### 1.2 新建一个仓库

1. 登录后，点右上角 **“+”** → 选 **“New repository”**。
2. **Repository name** 填：`landscape-configurator`（或任意英文名）。
3. 选 **Private** 或 **Public**（选 Public 别人能看到代码；Private 只有你能看，Vercel 也能连）。
4. **不要**勾选 “Add a README file”（你本地已有项目）。
5. 点下方绿色按钮 **“Create repository”**。
6. 创建好后，页面上会显示一个地址，类似：`https://github.com/你的用户名/landscape-configurator.git`，先**复制这个地址**，后面用。

### 1.3 在本地把代码推上去

1. 打开 **PowerShell** 或 **命令提示符**。
2. 输入下面命令，进入你的项目文件夹（把路径改成你电脑上的实际路径）：
   ```bash
   cd C:\Users\Wayne\landscape-configurator
   ```
3. 若这个文件夹**从没用过 git**，依次输入：
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/landscape-configurator.git
   git push -u origin main
   ```
   把 `https://github.com/你的用户名/landscape-configurator.git` 换成你在 1.2 里复制的地址。
4. 若提示登录 GitHub：在浏览器里登录 GitHub，或按提示用 **Personal Access Token** 当密码。
5. 推送成功后，在 GitHub 网页上刷新，能看到你的项目文件。

**说明**：`.env` 已在 `.gitignore` 里，不会被推上去，所以 Google 客户端 ID 不会暴露。后面在 Vercel 里单独填。

---

## 二、在 Vercel 上部署（每一步点哪里）

### 2.1 打开 Vercel 并登录

1. 浏览器打开：**https://vercel.com**
2. 点右上角 **“Log in”** 或 **“Sign Up”**。
3. 选 **“Continue with GitHub”**，按提示授权，用你的 GitHub 账号登录。

### 2.2 从 GitHub 导入项目

1. 登录后若在首页，点右上角 **“Add New…”** → 选 **“Project”**。  
   （若在仪表盘，就点 **“Add New…”** → **“Project”**。）
2. 在 **“Import Git Repository”** 下面，会看到你的 GitHub 仓库列表。
3. 找到 **“landscape-configurator”**（或你起的仓库名），右侧点 **“Import”**。  
   若没看到：点 **“Adjust GitHub App Permissions”**，勾选允许访问该仓库，再回来点 **“Import”**。

### 2.3 配置项目（重要：环境变量）

1. **Project Name**：可以保持默认（如 `landscape-configurator`），或改成你喜欢的英文名（会出现在链接里）。
2. **Framework Preset**：选 **“Vite”**（Vercel 会自动填好构建命令和输出目录）。
3. **Root Directory**：保持默认 **“./”** 不动。
4. **Build and Output Settings** 一般不用改，默认类似：
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **环境变量**（必填项）：
   - **Google 上传**：**Key** 填 `VITE_GOOGLE_CLIENT_ID`，**Value** 填你的 Google OAuth 客户端 ID（形如 `539234925956-xxxxx.apps.googleusercontent.com`），点 **Add**。
   - **Submit 发邮件**（“提交给老师”）：必须再加两条，否则点 Submit 会报 “Server not configured”：
     - **Key**：`RESEND_API_KEY`，**Value**：在 https://resend.com 创建的 API Key（以 `re_` 开头）。
     - **Key**：`TEACHER_EMAIL`，**Value**：**接收作业的邮箱**（填你自己的邮箱即可，例如 `你的名字@gmail.com`）。
   - 填好后列表中应有：`VITE_GOOGLE_CLIENT_ID`、`RESEND_API_KEY`、`TEACHER_EMAIL`。
6. 检查一遍上面几项，然后点页面下方的 **“Deploy”**。

### 2.4 等待部署完成

1. 会跳转到该项目的 **Deployment** 页面，显示 “Building…” / “Deploying…”。
2. 等 1～2 分钟，状态变成 **“Ready”** 或出现绿色勾。
3. 页面上会显示 **“Visit”** 或直接给一个链接，例如：  
   **https://landscape-configurator-xxx.vercel.app**  
   点进去就是你的网站，**这个链接可以发给任何人用**。

---

## 三、让“上传到 Google Drive”在公网链接下能用

1. 打开 **Google Cloud Console**：**https://console.cloud.google.com**
2. 选你之前建 OAuth 的那个项目。
3. 左侧 **“API 和服务”** → **“凭据”**。
4. 在 **“OAuth 2.0 客户端 ID”** 里点你用的那个客户端（Web 应用）。
5. 在 **“已授权的 JavaScript 源”** 里点 **“+ 添加 URI”**，填：  
   `https://你的项目名.vercel.app`  
   （例如：`https://landscape-configurator-xxx.vercel.app`，不要带末尾斜杠）
6. 点 **“保存”**。
7. 回到你的 Vercel 链接，刷新页面，再试一次“上传到 Google Drive”。

若应用还在“测试”模式，要在 **OAuth 同意屏幕 → 测试用户** 里加上要使用的人的 Gmail。

---

## 四、部署之后还能改吗？（可以，而且很简单）

**可以随时改，不是部署一次就定死。**

- **方式一（推荐）**：在本地改代码 → 保存 → 在项目文件夹里执行：
  ```bash
  git add .
  git commit -m "更新了某某功能"
  git push
  ```
  Vercel 会**自动**检测到 GitHub 有新提交，自动重新构建和部署，几分钟后你的**同一个链接**打开就是最新版。

- **方式二**：在 Vercel 网页上，进入该项目 → **“Deployments”** → 找到某次部署 → 右侧 **“...”** → **“Redeploy”**，会用当前代码再部署一次（适合只改环境变量、没改代码时）。

所以：**部署 = 把当前版本放到公网；以后改代码再 push，就等于“更新”这个公网版本，链接不变。**

---

## 五、以后怎么找到你的链接和项目

1. 打开 **https://vercel.com**，登录。
2. 首页或 **Dashboard** 里会看到你的项目 **landscape-configurator**。
3. 点进去 → **“Domains”** 或顶部的 **“Visit”**，就是你的公网链接。
4. 也可以把该链接加入浏览器书签，或发给朋友直接用。

---

## 六、常见问题

- **部署失败、报错**：在 Vercel 项目里点 **“Deployments”** → 点失败的那次 → 看 **“Building”** 里的日志，把红色报错复制下来，便于排查（或发给我）。
- **打开链接是空白**：先看浏览器控制台（F12）有没有报错；再确认环境变量 `VITE_GOOGLE_CLIENT_ID` 在 Vercel 里已填对，并**重新部署**一次。
- **Google 上传提示未授权**：检查 Google Cloud 里“已授权的 JavaScript 源”是否包含你的 `https://xxx.vercel.app`，且没有多余斜杠或 http。
- **Submit 报错 “Server not configured: set RESEND_API_KEY and TEACHER_EMAIL”**：在 Vercel 项目 **Settings → Environment Variables** 里添加 `RESEND_API_KEY`（Resend 的 API Key）和 `TEACHER_EMAIL`（你的收件邮箱），保存后到 **Deployments** 里点 **Redeploy** 再试。部署后前端会自动用当前网站地址（如 `https://landscape-configurator.vercel.app`）调用 `/api/submit`，无需再填本地地址。

按上面步骤做完，你就有一个**固定的、可分享的公网链接**，并且以后改代码只要 `git push` 就会自动更新，不需要重新“再部署一次”才能改。
