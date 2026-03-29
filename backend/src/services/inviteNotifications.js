import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendTeamInviteEmail(email, inviteData) {
  const { companyName, role, inviteId } = inviteData;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: #f9fafb;
          padding: 20px 10px;
        }
        .container { 
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header {
          background: #000000;
          color: white;
          padding: 40px 24px;
          text-align: center;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .header p {
          font-size: 16px;
          opacity: 0.9;
          font-weight: 500;
        }
        .content {
          padding: 32px 24px;
        }
        .invite-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .invite-card h2 {
          font-size: 22px;
          font-weight: 700;
          color: #000000;
          margin-bottom: 12px;
          letter-spacing: -0.3px;
        }
        .invite-card p {
          font-size: 15px;
          color: #6b7280;
          margin-bottom: 12px;
          line-height: 1.6;
        }
        .info-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          margin: 20px 0;
        }
        .info-box strong {
          color: #1f2937;
          font-size: 14px;
          display: block;
          margin-bottom: 4px;
        }
        .info-box p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }
        .steps {
          margin: 24px 0;
        }
        .steps h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 12px;
        }
        .steps ol {
          padding-left: 20px;
          color: #4b5563;
          font-size: 14px;
          line-height: 1.8;
        }
        .button {
          display: inline-block;
          background: #000000;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          text-align: center;
          margin: 16px 0;
        }
        .note {
          text-align: center;
          margin-top: 16px;
          font-size: 14px;
          color: #6b7280;
        }
        .note a {
          color: #000000;
          text-decoration: none;
          font-weight: 600;
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 12px;
          padding: 16px;
          margin-top: 20px;
        }
        .warning p {
          font-size: 14px;
          color: #92400e;
          margin: 0;
        }
        .warning strong {
          font-weight: 700;
        }
        .footer {
          text-align: center;
          padding: 24px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          font-size: 13px;
          color: #9ca3af;
          margin: 4px 0;
        }
        
        @media only screen and (max-width: 600px) {
          body { padding: 10px 5px; }
          .container { border-radius: 12px; }
          .header { padding: 32px 20px; }
          .header h1 { font-size: 24px; }
          .content { padding: 24px 20px; }
          .invite-card { padding: 20px; }
          .button { display: block; width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Team Invitation</h1>
          <p>You've been invited to join a team</p>
        </div>
        <div class="content">
          <div class="invite-card">
            <h2>Join ${companyName}</h2>
            <p>You've been invited to join the team as a <strong>${role}</strong>.</p>
            
            <div class="info-box">
              <strong>What's AutoExec AI?</strong>
              <p>An intelligent system that converts meeting transcripts into actionable tasks and automatically assigns them to team members based on skills and roles.</p>
            </div>

            <div class="steps">
              <h3>Next Steps:</h3>
              <ol>
                <li>Click the button below to create your account (if you don't have one)</li>
                <li>Accept the team invitation</li>
                <li>Start receiving task assignments automatically</li>
              </ol>
            </div>

            <div style="text-align: center;">
              <a href="${frontendUrl}/signup?email=${encodeURIComponent(email)}" class="button">
                Create Account & Join Team
              </a>
            </div>

            <p class="note">
              Already have an account? <a href="${frontendUrl}/login">Login here</a>
            </p>
          </div>

          <div class="warning">
            <p>
              <strong>⚠️ Important:</strong> This invitation is specific to your email address. Make sure to sign up with <strong>${email}</strong>
            </p>
          </div>
        </div>
        <div class="footer">
          <p>AutoExec AI</p>
          <p>Intelligent Meeting-to-Execution System</p>
          <p style="font-size: 12px; margin-top: 8px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `You're invited to join ${companyName} on AutoExec AI`,
    html
  });
}
