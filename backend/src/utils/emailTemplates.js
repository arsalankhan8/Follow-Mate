const baseStyles = `
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #0f172a;
  background: #f8fafc;
  padding: 32px;
`;

const cardStyles = `
  max-width: 480px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  padding: 32px;
`;

const badgeStyles = `
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: #eef2ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #4f46e5;
  font-size: 24px;
`;

const codeStyles = `
  font-size: 28px;
  letter-spacing: 8px;
  font-weight: 700;
  color: #111827;
  margin: 24px 0;
`;

const footerStyles = `
  margin-top: 24px;
  font-size: 13px;
  color: #64748b;
`;

const wrapEmail = (heading, body) => `
  <div style="${baseStyles}">
    <div style="${cardStyles}">
      ${body}
      <p style="${footerStyles}">
        This code will expire in 15 minutes. If you didn’t request this, you can safely ignore this email.
      </p>
      <p style="${footerStyles}">
        — The Follow Mate Team
      </p>
    </div>
  </div>
`;

export const verificationEmail = ({ name, code }) =>
  wrapEmail(
    "Verify Email",
    `
      <div style="${badgeStyles}">🔐</div>
      <h1 style="font-size:24px;margin:0 0 8px 0;">Confirm your email</h1>
      <p style="margin:0 0 8px 0;">Hi ${name || "there"},</p>
      <p style="margin:0 0 12px 0;">Use the code below to verify your Follow Mate account:</p>
      <div style="${codeStyles}">${code}</div>
      <p style="margin:0;">Enter this code in the app to finish creating your account.</p>
    `
  );

export const resetPasswordEmail = ({ name, code }) =>
  wrapEmail(
    "Reset Password",
    `
      <div style="${badgeStyles}">🛡️</div>
      <h1 style="font-size:24px;margin:0 0 8px 0;">Reset your password</h1>
      <p style="margin:0 0 8px 0;">Hi ${name || "there"},</p>
      <p style="margin:0 0 12px 0;">We received a request to reset your password. Enter the code below in the app to continue:</p>
      <div style="${codeStyles}">${code}</div>
      <p style="margin:0;">If you didn't request this, you can safely ignore this email.</p>
    `
  );

