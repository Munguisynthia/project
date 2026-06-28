# Email Troubleshooting Guide

## Quick Test

Test your email configuration by running this command:

```bash
curl -X POST http://localhost:3000/api/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

Replace `your-email@gmail.com` with your actual email.

---

## Checklist: Why Emails Aren't Arriving

### ✅ **Step 1: Verify Brevo API Key**

1. Check `.env.local` has `BREVO_API_KEY` set:
   ```bash
   # Should look like:
   BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxx
   ```

2. If missing, get one from [Brevo.com](https://www.brevo.com):
   - Sign up or log in
   - Go to **Settings → API Keys & SMTP**
   - Copy your API Key

### ✅ **Step 2: Verify Sender Email**

1. In `.env.local`, check `EMAIL_FROM`:
   ```bash
   EMAIL_FROM="Voting System <noreply@yourdomain.com>"
   ```

2. Go to [Brevo Dashboard](https://www.brevo.com):
   - **Settings → Senders & Identities → Senders**
   - Verify your sender email is listed and **verified** ✓
   - If not, click **"Add a Sender"** and complete verification

3. ⚠️ **Gmail Limitation**: Personal Gmail addresses (`@gmail.com`) are:
   - Often blocked by Brevo
   - Flagged as spam by recipients
   - Not recommended for transactional emails

   **Recommendation**: Use your own domain or a professional email service.

### ✅ **Step 3: Check Email Logs**

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Watch the terminal for email logs:
   ```
   [Email] Sending to user@example.com from noreply@yourdomain.com...
   [Email] Successfully sent to user@example.com
   ```

3. **If you see errors** like:
   - `400 Invalid sender` → Sender not verified in Brevo
   - `401 Unauthorized` → Invalid API key
   - `429 Too Many Requests` → Rate limited (wait and retry)

### ✅ **Step 4: Check Spam Folder**

- Test emails might go to **Spam/Junk**
- Mark as "Not Spam" to improve delivery
- Check **Promotions** tab if on Gmail

---

## Configuration Summary

| Component | Status | Where to Check |
|-----------|--------|-----------------|
| **BREVO_API_KEY** | `process.env.BREVO_API_KEY` | `.env.local` |
| **EMAIL_FROM** | `process.env.EMAIL_FROM` | `.env.local` |
| **Sender Verified** | ✓ Required | Brevo Dashboard → Senders |
| **API Rate Limit** | Depends on plan | Brevo Account Settings |

---

## Fix Checklist

- [ ] I have `BREVO_API_KEY` in `.env.local`
- [ ] I have `EMAIL_FROM` in `.env.local`
- [ ] My sender email is **verified** in Brevo dashboard
- [ ] I restarted the dev server: `npm run dev`
- [ ] I tested with `/api/debug/test-email` endpoint
- [ ] I checked the terminal for [Email] logs
- [ ] I checked my spam/junk folder

---

## Still Not Working?

Run this test to see detailed error info:

```bash
# Terminal command
curl -X POST http://localhost:3000/api/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Check the **response** and **server terminal logs** for specific error messages.

Common errors:
- **`Missing BREVO_API_KEY`** → Add it to `.env.local` and restart server
- **`Invalid EMAIL_FROM format`** → Must be: `"Name <email@domain.com>"`
- **`Sender email not verified`** → Verify in Brevo dashboard
- **`401 Unauthorized`** → Check API key is correct
