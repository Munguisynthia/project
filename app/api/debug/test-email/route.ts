import { NextRequest, NextResponse } from 'next/server';
import { sendCandidateInviteEmail } from '@/lib/email';

/**
 * TEST ENDPOINT - Send a test email to verify Brevo configuration
 * Usage: POST /api/debug/test-email
 * Body: { "email": "test@example.com" }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: 'Email address required. Send: { "email": "your-email@example.com" }' },
      { status: 400 }
    );
  }

  console.log('[Test Email] Starting test with:', { email });
  console.log('[Test Email] Brevo API Key:', process.env.BREVO_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('[Test Email] Email From:', process.env.EMAIL_FROM || 'Using default');

  try {
    await sendCandidateInviteEmail({
      to: email,
      candidateName: 'Test User',
      schoolName: 'Test School',
      position: 'Test Position',
      pitchUrl: 'https://example.com/test',
    });

    return NextResponse.json(
      {
        success: true,
        message: `Test email sent to ${email}`,
        notes: [
          '✓ Email sent successfully!',
          '- Check spam/junk folder if not in inbox',
          '- Verify sender email is configured in Brevo dashboard',
        ],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Test Email] Failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        troubleshooting: {
          'Missing BREVO_API_KEY': !process.env.BREVO_API_KEY,
          'Invalid EMAIL_FROM format': !process.env.EMAIL_FROM?.includes('@'),
          'Sender not verified in Brevo': 'Verify sender in Brevo dashboard: Settings → Senders',
          'API key invalid': 'Check BREVO_API_KEY in .env.local',
        },
      },
      { status: 500 }
    );
  }
}
