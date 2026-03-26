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
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }
        .invite-card { background: white; padding: 30px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: 600; }
        .button-secondary { background: #6b7280; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .highlight { color: #667eea; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">🎉 Team Invitation</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">You've been invited to join a team!</p>
        </div>
        <div class="content">
          <div class="invite-card">
            <h2 style="margin-top: 0; color: #1f2937;">Join <span class="highlight">${companyName}</span></h2>
            <p style="font-size: 16px; color: #4b5563;">You've been invited to join the team as a <strong>${role}</strong>.</p>
            
            <div style="background: #eff6ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af;"><strong>What's AutoExec AI?</strong></p>
              <p style="margin: 5px 0 0 0; color: #1e40af;">An intelligent system that converts meeting transcripts into actionable tasks and automatically assigns them to team members based on skills and roles.</p>
            </div>

            <h3 style="color: #1f2937; margin-top: 30px;">Next Steps:</h3>
            <ol style="color: #4b5563; line-height: 1.8;">
              <li>Click the button below to create your account (if you don't have one)</li>
              <li>Accept the team invitation</li>
              <li>Start receiving task assignments automatically!</li>
            </ol>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${frontendUrl}/signup?email=${encodeURIComponent(email)}" class="button">
                Create Account & Join Team
              </a>
            </div>

            <p style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
              Already have an account? <a href="${frontendUrl}/login" style="color: #667eea;">Login here</a>
            </p>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚠️ Important:</strong> This invitation is specific to your email address. Make sure to sign up with <strong>${email}</strong>
            </p>
          </div>
        </div>
        <div class="footer">
          <p>AutoExec AI - Intelligent Meeting-to-Execution System</p>
          <p style="font-size: 12px; color: #9ca3af;">If you didn't expect this invitation, you can safely ignore this email.</p>
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
