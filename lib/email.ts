// Original implementation used Resend. Updated to Brevo transactional email API.
// import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_STRING = process.env.EMAIL_FROM || 'Voting System <smungui731@gmail.com>';
const FROM_MATCH = FROM_STRING.match(/^(.*) <(.+)>$/);
const FROM_NAME = FROM_MATCH ? FROM_MATCH[1].trim() : 'Voting System';
const FROM_EMAIL = FROM_MATCH ? FROM_MATCH[2].trim() : FROM_STRING.trim();

async function sendBrevoEmail(opts: { to: string; subject: string; html: string }, retries = 3) {
  const { to, subject, html } = opts;

  if (!BREVO_API_KEY) {
    const error = new Error('Missing BREVO_API_KEY environment variable. Configure it in .env.local');
    console.error('[Email Config Error]', error.message);
    throw error;
  }

  if (!FROM_EMAIL || !FROM_EMAIL.includes('@')) {
    const error = new Error(`Invalid EMAIL_FROM format: "${FROM_STRING}". Use format: "Name <email@domain.com>"`);
    console.error('[Email Config Error]', error.message);
    throw error;
  }

  console.log(`[Email] Sending to ${to} from ${FROM_EMAIL}...`);

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      const errorMsg = `Brevo API error (${response.status}): ${body}`;
      console.error('[Email Error]', errorMsg);
      
      // Retry on server errors (5xx), but not on client errors (4xx)
      if (response.status >= 500 && retries > 0) {
        console.log(`[Email] Retrying... (${retries} attempts left)`);
        await new Promise(r => setTimeout(r, 1000)); // Wait 1 second before retry
        return sendBrevoEmail(opts, retries - 1);
      }
      
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log(`[Email] Successfully sent to ${to}`, result);
    return result;
  } catch (error: any) {
    console.error('[Email] Exception:', error.message);
    throw error;
  }
}

export async function sendCandidateInviteEmail(opts: {
  to: string;
  candidateName: string;
  schoolName: string;
  position: string;
  pitchUrl: string;
}) {
  const { to, candidateName, schoolName, position, pitchUrl } = opts;

  // Original Resend call kept for reference:
  // return resend.emails.send({ from: FROM, to, subject: `You've been nominated — ${position} at ${schoolName}`, html: `...` });

  return sendBrevoEmail({
    to,
    subject: `You've been nominated — ${position} at ${schoolName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color:#1E2733;">
        <h2 style="margin:0 0 16px; color:#243F80;">Hi ${candidateName},</h2>
        <p style="font-size:15px; line-height:1.6;">
          You've been registered as a candidate for <strong>${position}</strong> at ${schoolName}.
          Submit your pitch and photo so students can learn about you before they vote.
        </p>
        <a href="${pitchUrl}"
           style="display:inline-block; margin:20px 0; padding:12px 22px; background:#3D67CC;
                  color:#fff; text-decoration:none; border-radius:8px; font-weight:600;">
          Submit your pitch
        </a>
        <p style="font-size:13px; color:#7A8699;">This link expires in 72 hours.</p>
      </div>
    `,
  });
}

export async function sendStudentLoginLinkEmail(opts: {
  to: string;
  studentName: string;
  schoolName: string;
  verifyUrl: string;
}) {
  const { to, studentName, schoolName, verifyUrl } = opts;

  // Original Resend call kept for reference:
  // return resend.emails.send({ from: FROM, to, subject: `Your voting account is ready — ${schoolName}`, html: `...` });

  return sendBrevoEmail({
    to,
    subject: `Your voting account is ready — ${schoolName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color:#1E2733;">
        <h2 style="margin:0 0 16px; color:#243F80;">Hi ${studentName},</h2>
        <p style="font-size:15px; line-height:1.6;">
          Your school has added you to the voting system. Confirm your email to activate
          your account, then you'll be able to log in any time to vote in upcoming sessions.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block; margin:20px 0; padding:12px 22px; background:#3D67CC;
                  color:#fff; text-decoration:none; border-radius:8px; font-weight:600;">
          Confirm & continue to login
        </a>
        <p style="font-size:13px; color:#7A8699;">This link expires in 72 hours.</p>
      </div>
    `,
  });
}

export async function sendOtpEmail(opts: { to: string; studentName: string; code: string }) {
  const { to, studentName, code } = opts;

  // Original Resend call kept for reference:
  // return resend.emails.send({ from: FROM, to, subject: `Your login code: ${code}`, html: `...` });

  return sendBrevoEmail({
    to,
    subject: `Your login code: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color:#1E2733;">
        <h2 style="margin:0 0 16px; color:#243F80;">Hi ${studentName},</h2>
        <p style="font-size:15px; line-height:1.6;">Use this code to finish signing in:</p>
        <p style="font-size:32px; font-weight:700; letter-spacing:6px; color:#243F80; margin:24px 0;">${code}</p>
        <p style="font-size:13px; color:#7A8699;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendVoteConfirmationEmail(opts: {
  to: string;
  studentName: string;
  candidateName: string;
  position: string;
  sessionTitle: string;
}) {
  const { to, studentName, candidateName, position, sessionTitle } = opts;

  // Original Resend call kept for reference:
  // return resend.emails.send({ from: FROM, to, subject: `Your vote has been recorded — ${sessionTitle}`, html: `...` });

  return sendBrevoEmail({
    to,
    subject: `Your vote has been recorded — ${sessionTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color:#1E2733;">
        <h2 style="margin:0 0 16px; color:#243F80;">Thanks for voting, ${studentName}! 🎉</h2>
        <p style="font-size:15px; line-height:1.6;">
          Your vote for <strong>${candidateName}</strong> (${position}) in
          <strong>${sessionTitle}</strong> has been recorded.
        </p>
        <p style="font-size:13px; color:#7A8699;">You can track live results any time from your dashboard.</p>
      </div>
    `,
  });
}

export async function sendSchoolSetupEmail(opts: {
  to: string;
  schoolName: string;
  setupUrl: string;
}) {
  const { to, schoolName, setupUrl } = opts;

  // Original Resend call kept for reference:
  // return resend.emails.send({ from: FROM, to, subject: `Activate your school account — ${schoolName}`, html: `...` });

  return sendBrevoEmail({
    to,
    subject: `Activate your school account — ${schoolName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color:#1E2733;">
        <h2 style="margin:0 0 16px; color:#243F80;">Welcome, ${schoolName}</h2>
        <p style="font-size:15px; line-height:1.6;">
          Your school has been registered on the Voting System. To activate your
          administrator account and set a password, use the link below.
        </p>
        <a href="${setupUrl}"
           style="display:inline-block; margin:20px 0; padding:12px 22px; background:#3D67CC;
                  color:#fff; text-decoration:none; border-radius:8px; font-weight:600;">
          Activate school account
        </a>
        <p style="font-size:13px; color:#7A8699;">
          This link expires in 48 hours. If you didn't expect this email, you can ignore this email.
        </p>
      </div>
    `,
  });
}
