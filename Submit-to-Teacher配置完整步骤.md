# 「Submit to teacher」完整配置步骤（一步步、点哪里都写明）

学生点击 **「Submit to teacher」** 后，JSON 会以**邮件附件**形式发到你（老师）的邮箱。下面从零开始，每一步告诉你**打开哪个网页、点哪里、填什么、最后要给我/要保存什么**。

---

## 先只在本地跑通（还没部署到 Vercel）

如果你**还没部署到 Vercel**，想先在本地把「Submit to teacher」调通，按下面做即可。Resend 的注册和 API Key 同样要做（见下面「第一步」），只是**不填 Vercel**，改成在本地配环境变量并跑一个本地接口。

### 1. 去 Resend 拿到 API Key（必须）

- 打开 **https://resend.com** → **Sign Up** 注册/登录。
- 左侧点 **API Keys** → **Create API Key** → Name 随便填，Permission 选 **Sending access** → 创建后**复制**以 `re_` 开头的 Key，保存好。
- 同时想好**收作业的邮箱**（TEACHER_EMAIL），例如你的 Gmail。

### 2. 在项目里建 .env.local（本地配置）

1. 在项目**根目录**（和 `package.json` 同级）新建文件 **`.env.local`**（没有的话可先复制 **`.env.local.example`** 再改）。
2. 在 `.env.local` 里写上（把值换成你自己的）：

```env
RESEND_API_KEY=re_你复制的Key
TEACHER_EMAIL=你的收件邮箱@example.com
VITE_SUBMIT_API_URL=http://localhost:3001/submit
```

3. 保存。`.env.local` 已在 .gitignore 里，不会被提交到 git。

### 3. 开两个终端，同时跑「本地接口」和「前端」

**终端 1：跑本地提交接口**

```bash
cd C:\Users\Wayne\landscape-configurator
npm run dev:api
```

看到 `[Submit API] 本地接口已启动: http://localhost:3001/submit` 就说明接口在跑了，**不要关**。

**终端 2：跑前端页面**

```bash
cd C:\Users\Wayne\landscape-configurator
npm run dev
```

浏览器打开提示的地址（一般是 **http://localhost:5173**）。

### 4. 在页面上测试

1. 在画布上随便放几个组件（或加载一个模板）。
2. 点顶部蓝色按钮 **「Submit to teacher」**。
3. 若成功，会提示「提交成功！已发送到老师邮箱」；去 **TEACHER_EMAIL** 邮箱里查收带 JSON 附件的邮件。

若提示「未配置提交地址」：检查 `.env.local` 里是否有 **VITE_SUBMIT_API_URL=http://localhost:3001/submit**，且**重启**一次 `npm run dev`（改 .env 后要重启前端）。  
若提示「提交失败」：看终端 1（dev:api）里有没有报错；确认 **RESEND_API_KEY**、**TEACHER_EMAIL** 没写错。

### 5. 以后部署到 Vercel 时

到时按下面「前提」之后的步骤，在 **Vercel 的 Environment Variables** 里填 **RESEND_API_KEY** 和 **TEACHER_EMAIL**，并 Redeploy。部署后就不用在本地跑 `npm run dev:api` 了，前端会自动用网站自己的 `/api/submit`。

---

## 前提（部署到 Vercel 时再看）

- 项目已经能**在 Vercel 上正常部署**（能打开你的 `https://xxx.vercel.app` 网页）。
- 若还没部署，先按 **《VERCEL部署详细步骤.md》** 做完「把项目放到 GitHub」和「在 Vercel 上部署」。

---

## 第一步：在 Resend 注册并拿到 API Key

Resend 是一个发邮件的服务，我们用它把学生的 JSON 附件发到你的邮箱。**免费版每天约 100 封**，够作业用。

### 1.1 打开 Resend 网站

1. 浏览器打开：**https://resend.com**
2. 页面右上角会看到 **「Sign Up」** 或 **「Log in」**。

### 1.2 注册账号

1. 点 **「Sign Up」**。
2. 可以用 **「Continue with Google」** 或 **「Continue with GitHub」** 一键注册（推荐），或用邮箱注册。
3. 按页面提示完成注册/登录，进入 Resend 的 **Dashboard（仪表盘）**。

### 1.3 创建 API Key（这是你要拿到的东西）

1. 在 Resend 页面**左侧边栏**，找到并点击 **「API Keys」**（或 **「API Keys」** 在 **「Integrate」** 菜单下）。
2. 进入 API Keys 页面后，点右上角 **「Create API Key」** 按钮。
3. 弹出框里：
   - **Name**：随便填，例如 `landscape-pro-submit`（方便以后辨认）。
   - **Permission**：选 **「Sending access」**（只用来发邮件即可）。
4. 点 **「Add」** 或 **「Create」**。
5. **重要**：创建成功后，页面上会**只显示一次**一串以 **`re_`** 开头的 Key（例如 `re_123abc...`）。
   - 立刻**复制**这串 Key，保存到记事本或密码管理器。
   - 若没复制就关掉了，只能删掉这个 Key，再新建一个。

**你要保留的东西：**

- 这一串 **API Key**（形如 `re_xxxxxxxxxxxx`），后面要填到 Vercel 里。

---

## 第二步：确认你的「老师邮箱」

- 就是**你要收作业**的那个邮箱地址，例如：`teacher@school.edu` 或你的 Gmail。
- 学生提交后，带 JSON 附件的邮件会发到这个地址。

**你要保留的东西：**

- **老师邮箱**（一个完整的邮箱地址），后面要填到 Vercel 里。

---

## 第三步：在 Vercel 里添加环境变量（把 Resend 和邮箱告诉网站）

环境变量 = 网站运行时要用的「配置」，例如 API Key 和收件邮箱。**不要**把这些写进代码里，只在 Vercel 里填一次。

### 3.1 打开你的 Vercel 项目

1. 浏览器打开：**https://vercel.com**
2. 登录后，在 **Dashboard** 里找到你的项目（例如 **landscape-configurator**），**点项目名**进入该项目。

### 3.2 打开环境变量设置页

1. 在项目页面顶部，有一排标签：**Overview**、**Deployments**、**Analytics**、**Settings** 等。
2. 点 **「Settings」**。
3. 左侧边栏里，找到 **「Environment Variables」**，点进去。

### 3.3 添加三个变量（逐条添加）

下面每一条都是：点 **「Add New」** 或 **「Add」**，填 **Name** 和 **Value**，选环境，保存。

---

**变量 1：Resend 的 API Key**

- **Name（名称）**：`RESEND_API_KEY`  
  （必须一模一样，不能多空格、不能改大小写。）
- **Value（值）**：粘贴你在 **第一步** 复制的、以 `re_` 开头的那串 Key。
- **Environment**：三个都勾选（**Production**、**Preview**、**Development**），或至少勾选 **Production**。
- 点 **「Save」**。

---

**变量 2：老师邮箱（收作业的邮箱）**

- **Name**：`TEACHER_EMAIL`
- **Value**：你的收件邮箱，例如 `teacher@school.edu`。
- **Environment**：同上，三个都勾选或至少 Production。
- 点 **「Save」**。

---

**变量 3（可选）：发件人显示**

- **Name**：`FROM_EMAIL`
- **Value**：可以填 `LandscapePro <onboarding@resend.dev>`（用 Resend 默认发件地址），或你在 Resend 里验证过的域名邮箱。
- **不填也可以**：不填则代码里会用默认的 `LandscapePro <onboarding@resend.dev>`。
- 若填了，**Environment** 同上，点 **「Save」**。

---

### 3.4 检查

在 **Environment Variables** 列表里，你应该至少看到：

- `RESEND_API_KEY`  
- `TEACHER_EMAIL`  

这样「Submit to teacher」的后台就配置好了。

---

## 第四步：重新部署（让环境变量生效）

Vercel 只有在**部署时**才会把环境变量打进运行环境，所以改完环境变量后要**重新部署一次**。

### 4.1 打开部署列表

1. 还在你的 Vercel 项目里。
2. 点顶部 **「Deployments」** 标签。
3. 会看到一列部署记录，最上面一条是**当前线上版本**（前面可能有绿色的 **Production** 标记）。

### 4.2 触发重新部署

1. 点**最上面那条部署**右侧的 **「⋯」**（三个点）。
2. 在菜单里选 **「Redeploy」**。
3. 弹出框里直接再点 **「Redeploy」** 确认。
4. 等几十秒到一两分钟，状态变成 **Ready** 就表示新版本（带新环境变量）已生效。

---

## 第五步：在网页上测试「Submit to teacher」

1. 打开你的网站：`https://你的项目名.vercel.app`（或你绑定的域名）。
2. 随便在画布上放几个组件（或加载一个模板）。
3. 点顶部蓝色按钮 **「Submit to teacher」**。
4. 若成功，页面会提示 **「提交成功！已发送到老师邮箱」**。
5. 去你填的 **TEACHER_EMAIL** 邮箱里查收：
   - 应有一封主题类似 **「[LandscapePro] 作业提交 - landscape_config_v051_xxx.json」** 的邮件；
   - 附件就是该 JSON 文件。

若提示 **「提交失败」**：  
- 检查 Vercel 里 **RESEND_API_KEY**、**TEACHER_EMAIL** 是否填对、是否已 **Redeploy**；  
- 检查 Resend 的 API Key 是否有效（没删除、权限为 Sending access）。

---

## 总结：你要准备和要填的东西

| 步骤 | 在哪里弄 | 要得到/要填什么 |
|------|----------|------------------|
| Resend 注册 | https://resend.com → Sign Up | 无（只是注册） |
| Resend API Key | Resend 左侧 **API Keys** → **Create API Key** → 复制 `re_xxx` | 一串 **API Key**（`re_...`） |
| 老师邮箱 | 自己决定 | 一个**收件邮箱地址** |
| Vercel 环境变量 | 项目 **Settings** → **Environment Variables** | 添加 **RESEND_API_KEY**、**TEACHER_EMAIL**（**FROM_EMAIL** 可选） |
| 生效 | **Deployments** → 最新一条 → **⋯** → **Redeploy** | 重新部署一次 |

---

## 以后如果要改

- **换一个收作业的邮箱**：在 Vercel 的 **Environment Variables** 里改 **TEACHER_EMAIL** 的值，保存后再 **Deployments → Redeploy**。
- **Resend Key 泄露或想换 Key**：在 Resend 里删掉旧 Key、新建一个，把新 Key 填到 Vercel 的 **RESEND_API_KEY**，再 Redeploy。

按上面步骤做完，「Submit to teacher」就可以稳定使用；学生无需登录，一点就能把 JSON 发到你邮箱。

---

## 以后若需要别人/技术支持时，可以提供这些

- **不要**把 `RESEND_API_KEY`（`re_xxx`）或密码发给别人。
- 可以提供：
  - 做到第几步了（例如：Resend 已注册，Vercel 已加环境变量）。
  - Vercel 项目名（例如 `landscape-configurator`）。
  - 报错时：浏览器里点「Submit to teacher」后页面提示的**完整错误文字**，或截图；若方便，Vercel 里 **Deployments → 某次部署 → Logs** 里的报错信息。
- 这样别人可以帮你排查，而不需要你的 Key 或邮箱密码。
