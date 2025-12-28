// Email rendering functions using template strings (no React dependency)
// This avoids the react-dom/server import issue with Next.js App Router

// Lumos brand colors
const LUMOS_ORANGE = "#ff6719";
const LUMOS_DARK = "#1a1a1a";
const LUMOS_GRAY = "#666666";
const LUMOS_LIGHT_GRAY = "#f5f5f5";

export interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
}

export interface SubscriptionConfirmEmailProps {
  subscriberName?: string;
  publicationName: string;
  publicationUrl: string;
  confirmUrl: string;
}

export interface NewPostEmailProps {
  subscriberName?: string;
  publicationName: string;
  postTitle: string;
  postExcerpt?: string;
  postUrl: string;
  authorName: string;
  unsubscribeUrl: string;
}

export interface PasswordResetEmailProps {
  userName?: string;
  resetUrl: string;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function wrapEmail(content: string, previewText?: string): string {
  const previewSection = previewText
    ? `<div style="display:none;font-size:1px;color:${LUMOS_LIGHT_GRAY};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(previewText)}</div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>Lumos</title>
</head>
<body style="background-color:${LUMOS_LIGHT_GRAY};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;">
${previewSection}
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:${LUMOS_LIGHT_GRAY};padding:40px 20px;">
<tbody>
<tr>
<td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<tbody>
<tr>
<td style="padding:32px 40px;border-bottom:3px solid ${LUMOS_ORANGE};">
<h1 style="margin:0;font-size:28px;font-weight:700;color:${LUMOS_DARK};letter-spacing:-0.5px;">Lumos</h1>
</td>
</tr>
<tr>
<td style="padding:40px;">${content}</td>
</tr>
<tr>
<td style="padding:24px 40px;background-color:${LUMOS_LIGHT_GRAY};border-top:1px solid #e0e0e0;">
<p style="margin:0;font-size:13px;color:${LUMOS_GRAY};text-align:center;line-height:20px;">
Lumos - Your newsletter platform<br />
<a href="{{{unsubscribeUrl}}}" style="color:${LUMOS_GRAY};text-decoration:underline;">Unsubscribe</a> | <a href="{{{preferencesUrl}}}" style="color:${LUMOS_GRAY};text-decoration:underline;">Manage preferences</a>
</p>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</body>
</html>`;
}

function createButton(href: string, text: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0">
<tbody>
<tr>
<td style="background-color:${LUMOS_ORANGE};border-radius:6px;">
<a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;text-align:center;">${escapeHtml(text)}</a>
</td>
</tr>
</tbody>
</table>`;
}

export function renderWelcomeEmail(props: WelcomeEmailProps): string {
  const { userName, loginUrl } = props;
  const content = `
<h2 style="margin:0 0 24px;font-size:24px;font-weight:600;color:${LUMOS_DARK};line-height:32px;">Welcome to Lumos!</h2>
<p style="margin:0 0 16px;font-size:16px;color:${LUMOS_GRAY};line-height:26px;">Hi ${escapeHtml(userName || "there")},</p>
<p style="margin:0 0 16px;font-size:16px;color:${LUMOS_GRAY};line-height:26px;">Thank you for joining Lumos! We are excited to have you as part of our community of readers and writers.</p>
<p style="margin:0 0 24px;font-size:16px;color:${LUMOS_GRAY};line-height:26px;">With Lumos, you can discover amazing newsletters, subscribe to your favorite writers, and even start your own publication.</p>
${createButton(loginUrl, "Get Started")}
<p style="margin:24px 0 0;font-size:14px;color:${LUMOS_GRAY};line-height:22px;">If you have any questions, just reply to this email. We are always happy to help!</p>
`;
  return wrapEmail(content, `Welcome to Lumos, ${userName}!`);
}

export function renderSubscriptionConfirmEmail(
  props: SubscriptionConfirmEmailProps
): string {
  const { subscriberName, publicationName, publicationUrl, confirmUrl } = props;
  const content = `
<h2 style="margin:0 0 24px;font-size:24px;font-weight:600;color:${LUMOS_DARK};line-height:32px;">Confirm your subscription</h2>
<p style="margin:0 0 16px;font-size:16px;color:${LUMOS_GRAY};line-height:26px;">Hi ${escapeHtml(subscriberName || "there")},</p>
<p style="margin:0 0 16px;font-size:16px;color:${LUMOS_GRAY};line-height:26px;">You requested to subscribe to <a href="${escapeHtml(publicationUrl)}" style="color:${LUMOS_ORANGE};text-decoration:none;font-weight:600;">${escapeHtml(publicationName)}</a>. Please confirm your subscription by clicking the button below.</p>
<p style="margin:0 0 24px;font-size:16px;color:${LUMOS_GRAY};line-height:26px;">This helps us ensure that you really want to receive emails from this publication.</p>
${createButton(confirmUrl, "Confirm Subscription")}
<p style="margin:24px 0 0;font-size:14px;color:${LUMOS_GRAY};line-height:22px;">If you did not request this subscription, you can safely ignore this email.</p>
`;
  return wrapEmail(content, `Confirm your subscription to ${publicationName}`);
}

export function renderNewPostEmail(props: NewPostEmailProps): string {
  const {
    subscriberName,
    publicationName,
    postTitle,
    postExcerpt,
    postUrl,
    authorName,
    unsubscribeUrl,
  } = props;

  const excerptSection = postExcerpt
    ? `<p style="margin:0 0 24px;font-size:16px;color:${LUMOS_GRAY};line-height:26px;border-left:3px solid ${LUMOS_ORANGE};padding-left:16px;">${escapeHtml(postExcerpt)}</p>`
    : "";

  const content = `
<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${LUMOS_ORANGE};text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(publicationName)}</p>
<h2 style="margin:0 0 16px;font-size:28px;font-weight:700;color:${LUMOS_DARK};line-height:36px;">${escapeHtml(postTitle)}</h2>
<p style="margin:0 0 24px;font-size:14px;color:${LUMOS_GRAY};">By ${escapeHtml(authorName)}</p>
${excerptSection}
${createButton(postUrl, "Read Full Post")}
<hr style="margin:32px 0;border:none;border-top:1px solid #e0e0e0;" />
<p style="margin:0;font-size:13px;color:${LUMOS_GRAY};line-height:20px;">You are receiving this email because you are subscribed to ${escapeHtml(publicationName)}.<br /><a href="${escapeHtml(unsubscribeUrl)}" style="color:${LUMOS_GRAY};text-decoration:underline;">Unsubscribe from this publication</a></p>
`;
  return wrapEmail(content, `New post: ${postTitle}`);
}

export function renderPasswordResetEmail(
  props: PasswordResetEmailProps
): string {
  const { userName, resetUrl } = props;
  const content = `
<h2 style="margin:0 0 24px;font-size:24px;font-weight:600;color:${LUMOS_DARK};line-height:32px;">Reset your password</h2>
<p style="margin:0 0 16px;font-size:16px;color:${LUMOS_GRAY};line-height:26px;">Hi ${escapeHtml(userName || "there")},</p>
<p style="margin:0 0 16px;font-size:16px;color:${LUMOS_GRAY};line-height:26px;">We received a request to reset the password for your Lumos account. Click the button below to choose a new password.</p>
<p style="margin:0 0 24px;font-size:16px;color:${LUMOS_GRAY};line-height:26px;">This link will expire in 1 hour for security reasons.</p>
${createButton(resetUrl, "Reset Password")}
<p style="margin:24px 0 0;font-size:14px;color:${LUMOS_GRAY};line-height:22px;">If you did not request a password reset, please ignore this email or contact support if you have concerns about your account security.</p>
<hr style="margin:24px 0;border:none;border-top:1px solid #e0e0e0;" />
<p style="margin:0;font-size:13px;color:${LUMOS_GRAY};line-height:20px;">Alternatively, copy and paste this link into your browser:<br /><a href="${escapeHtml(resetUrl)}" style="color:${LUMOS_ORANGE};text-decoration:none;word-break:break-all;">${escapeHtml(resetUrl)}</a></p>
`;
  return wrapEmail(content, "Reset your Lumos password");
}
