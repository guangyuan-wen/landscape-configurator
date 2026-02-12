# Google Drive 上传功能配置指南

## 功能说明

现在点击 "上传到 Google Drive" 按钮时，JSON 文件会自动上传到您指定的 Google Drive 文件夹，而不是下载到本地。

## 配置步骤

### 1. 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](image.png
2. 创建一个新项目或选择现有项目
3. 启用 **Google Drive API**：
   - 在左侧菜单选择 "API 和服务" > "库"
   - 搜索 "Google Drive API"
   - 点击 "启用"

### 2. 创建 OAuth 2.0 凭据

1. 在 Google Cloud Console 中，转到 "API 和服务" > "凭据"
2. 点击 "创建凭据" > "OAuth 客户端 ID"
3. 如果提示配置 OAuth 同意屏幕，请完成配置：
   - 选择用户类型（通常选择"外部"）
   - 填写应用名称等信息
   - 添加您的邮箱到测试用户列表（如果选择外部用户类型）
4. 创建 OAuth 客户端 ID：
   - 应用类型：选择 "Web 应用"
   - 名称：Landscape Configurator
   - 已授权的 JavaScript 源：添加 `http://localhost:5173`（开发环境）
   - 已授权的重定向 URI：添加 `http://localhost:5173`
5. 点击 "创建"，复制生成的 **客户端 ID**

### 3. 配置环境变量

1. 在项目根目录创建 `.env` 文件（如果不存在）
2. 添加以下内容：

```
VITE_GOOGLE_CLIENT_ID=您的客户端ID.apps.googleusercontent.com
```

3. 将 `您的客户端ID` 替换为步骤 2 中复制的实际客户端 ID

### 4. 重启开发服务器

配置完成后，重启开发服务器：

```bash
npm run dev
```

## 使用方法

1. 首次使用时，点击 "上传到 Google Drive" 按钮
2. 系统会弹出 Google 登录窗口，请登录您的 Google 账号
3. 授权应用访问 Google Drive
4. 授权成功后，文件会自动上传到指定的文件夹：
   `https://drive.google.com/drive/folders/1Bfgu-mnON0dfQSEK33-GKOvMrpENx4bl`

## 注意事项

- 首次使用需要授权，授权信息会保存在浏览器中
- 如果授权过期，系统会自动提示重新授权
- 文件会以带时间戳的文件名保存，避免覆盖
- 上传成功后，可以在 Google Drive 文件夹中查看文件

## 解决「禁止访问 / 尚未完成 Google 验证」(403 access_denied)

若登录时出现 **“'Wayne' 尚未完成 Google 验证流程”** 或 **“此应用正在测试中，仅供已获开发者批准的测试人员使用”**：

1. 打开 [Google Cloud Console](https://console.cloud.google.com/) → 选择您的项目。
2. 左侧菜单：**API 和服务** → **OAuth 同意屏幕**。
3. 在页面中找到 **“测试用户”** 区域，点击 **“添加用户”**。
4. 输入要允许登录的 Gmail 地址（例如 `suannai0520@gmail.com`），点击保存。
5. 保存后，用该账号重新在网页里点击「打开 Google 登录窗口」并登录即可。

应用在“测试”模式下只能由这里添加的测试用户登录；添加后无需等待审核，立即可用。

## 故障排除

如果遇到问题：

1. **认证失败**：检查客户端 ID 是否正确配置
2. **API 未启用**：确保已在 Google Cloud Console 中启用 Google Drive API
3. **权限错误**：确保 OAuth 同意屏幕已正确配置
4. **CORS 错误**：确保已授权的 JavaScript 源包含当前域名

## 生产环境配置

部署到生产环境时，请：

1. 在 Google Cloud Console 中添加生产域名到已授权的 JavaScript 源
2. 更新 `.env` 文件中的配置
3. 确保 OAuth 同意屏幕已发布（如果使用外部用户类型）
