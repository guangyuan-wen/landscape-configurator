/**
 * 本地调试用：与 api/submit.js 相同逻辑，在本地跑一个接口供「Submit to teacher」调用
 * 用法：先配置 .env.local（RESEND_API_KEY、TEACHER_EMAIL），再运行 npm run dev:api
 */
import http from 'http';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function loadEnvLocal() {
  const paths = [
    join(rootDir, '.env.local'),
    join(process.cwd(), '.env.local'),
  ];
  for (const filePath of paths) {
    if (!existsSync(filePath)) continue;
    let content = readFileSync(filePath, 'utf8');
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) {
        const val = m[2].trim().replace(/^["']|["']$/g, '').replace(/\r$/, '');
        process.env[m[1].trim()] = val;
      }
    }
    return;
  }
}

loadEnvLocal();

const PORT = Number(process.env.SUBMIT_API_PORT) || 3001;
const apiKey = process.env.RESEND_API_KEY;
const teacherEmail = process.env.TEACHER_EMAIL;
const fromEmail = process.env.FROM_EMAIL || 'LandscapePro <onboarding@resend.dev>';

function sendJson(res, status, data) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(status);
  res.end(JSON.stringify(data));
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method !== 'POST' || req.url !== '/submit') {
    sendJson(res, 404, { error: 'Not found. Use POST /submit' });
    return;
  }

  if (!apiKey || !teacherEmail) {
    sendJson(res, 500, {
      error: '本地未配置：请在项目根目录创建 .env.local，填写 RESEND_API_KEY 和 TEACHER_EMAIL',
    });
    return;
  }

  const body = await new Promise((resolve, reject) => {
    let s = '';
    req.on('data', (chunk) => { s += chunk; });
    req.on('end', () => resolve(s));
    req.on('error', reject);
  });
  let payload;
  try {
    payload = JSON.parse(body || '{}');
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body' });
    return;
  }
  const { fileName = 'landscape_config.json', data } = payload;
  if (!data || typeof data !== 'string') {
    sendJson(res, 400, { error: 'Missing or invalid body: { fileName, data }' });
    return;
  }

  try {
    const base64Content = Buffer.from(data, 'utf8').toString('base64');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [teacherEmail],
        subject: `[LandscapePro] 作业提交 - ${fileName}`,
        html: `<p>学生通过 LandscapePro 提交了设计配置，请查收附件 ${fileName}。</p>`,
        attachments: [{ filename: fileName, content: base64Content }],
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error('Resend API error:', result);
      sendJson(res, response.status, { error: result.message || 'Email send failed' });
      return;
    }
    sendJson(res, 200, { ok: true, id: result.id });
  } catch (err) {
    console.error('submit error:', err);
    sendJson(res, 500, { error: err.message || 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`[Submit API] 本地接口已启动: http://localhost:${PORT}/submit`);
  if (!apiKey || !teacherEmail) {
    console.log('请创建 .env.local 并填写 RESEND_API_KEY、TEACHER_EMAIL 后重启');
  }
});
