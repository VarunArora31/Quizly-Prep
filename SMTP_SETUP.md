# SMTP Setup Guide - Brevo Integration

## Overview
This guide helps you configure Brevo SMTP for email authentication in your Quizly Prep application.

## Step 1: Configure Brevo SMTP

### 1.1 Get Brevo SMTP Credentials
1. Sign up/login to [Brevo](https://www.brevo.com)
2. Go to **SMTP & API** → **SMTP** in your dashboard
3. Note down your SMTP credentials:
   - SMTP Server: `smtp-relay.brevo.com`
   - Port: `587` (TLS) or `465` (SSL)
   - Login: Your Brevo account email
   - Password: Your Brevo password or SMTP key

### 1.2 Verify Sender Email
1. In Brevo dashboard, go to **Senders & IP**
2. Add and verify your sender email address
3. This email will be used as the "from" address in authentication emails

## Step 2: Configure Local Development

### 2.1 Update .env file
Replace the SMTP placeholders in your `.env` file:

```env
# SMTP Configuration (Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_USER=your-actual-brevo-email@example.com
SMTP_PASS=your-actual-brevo-password
SMTP_SENDER_EMAIL=your-verified-sender@example.com
SMTP_SENDER_NAME=Quizly Prep
SMTP_ADMIN_EMAIL=your-admin-email@example.com
```

### 2.2 Start Local Supabase (if using local development)
```bash
# Start local Supabase with new config
supabase start
```

## Step 3: Configure Production (Supabase Dashboard)

### 3.1 Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `ygvzeoyhpesjtaqxijsk`

### 3.2 Configure SMTP Settings
1. Navigate to **Authentication** → **Settings**
2. Scroll down to **SMTP Settings**
3. Enable **"Enable custom SMTP"**
4. Fill in your Brevo credentials:
   ```
   SMTP Host: smtp-relay.brevo.com
   SMTP Port: 587
   SMTP User: your-brevo-email@example.com
   SMTP Pass: your-brevo-password
   Sender Name: Quizly Prep
   Sender Email: your-verified-sender@example.com
   ```

### 3.3 Update Site URL
1. In **Authentication** → **Settings**
2. Update **Site URL** to your production domain
3. Add **Additional Redirect URLs** if needed

### 3.4 Customize Email Templates
1. Go to **Authentication** → **Email Templates**
2. Customize the **"Confirm signup"** template
3. Update any links to point to your production domain

## Step 4: Test the Setup

### 4.1 Test Signup Flow
1. Try signing up with a real email address
2. Check if the confirmation email is sent via Brevo
3. Verify the email links work correctly

### 4.2 Common Issues and Solutions

**Error: "Error {}"**
- This usually means SMTP configuration is incorrect
- Verify your Brevo credentials
- Check that your sender email is verified in Brevo

**Email not received**
- Check spam folder
- Verify sender email is verified in Brevo
- Check Brevo sending limits/quotas

**Authentication errors**
- Verify SMTP credentials in Brevo dashboard
- Ensure you're using the correct port (587 for TLS)
- Check if your Brevo account is active

## Step 5: Alternative Quick Setup (Gmail)

If you prefer to use Gmail instead of Brevo:

1. Enable 2-Step Verification in your Google Account
2. Generate an App Password:
   - Go to Google Account → Security → App passwords
   - Generate password for "Mail"
3. Use these settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

## Support

If you continue to have issues:
1. Check Supabase logs in the dashboard
2. Verify your email provider's sending limits
3. Test with a different email address
4. Contact Brevo support if needed

## Security Notes

- Never commit your actual SMTP credentials to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your SMTP passwords
- Monitor your email sending quotas
