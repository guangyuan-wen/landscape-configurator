/**
 * Vercel Serverless: 接收学生提交的 JSON，作为邮件附件发送到老师邮箱
 * 需要在 Vercel 环境变量中配置：RESEND_API_KEY, TEACHER_EMAIL, FROM_EMAIL（可选，默认用 Resend 沙箱）
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const teacherEmail = process.env.TEACHER_EMAIL;
  const fromEmail = process.env.FROM_EMAIL || 'LandscapePro <onboarding@resend.dev>';

  if (!apiKey || !teacherEmail) {
    return res.status(500).json({
      error: 'Server not configured: set RESEND_API_KEY and TEACHER_EMAIL in Vercel environment variables.',
    });
  }

  try {
    const { fileName = 'landscape_config.json', data } = req.body || {};
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid body: { fileName, data }' });
    }

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
        attachments: [
          {
            filename: fileName,
            content: base64Content,
          },
        ],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return res.status(response.status).json({ error: result.message || 'Email send failed' });
    }

    return res.status(200).json({ ok: true, id: result.id });
  } catch (err) {
    console.error('submit API error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
