# SendGrid Sender Authentication Guide

## What is Sender Authentication?

Sender authentication proves to email providers (Gmail, Outlook, etc.) that you're authorized to send emails from your domain or email address. Without it, your emails may be marked as spam or rejected entirely.

## Two Authentication Methods

### Option 1: Single Sender Verification (Easiest)
**Best for**: Testing, small applications, personal projects

### Option 2: Domain Authentication (Recommended for Production)
**Best for**: Business applications, higher email volumes, better deliverability

---

## Method 1: Single Sender Verification

### Step 1: Access Sender Authentication
1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **Sender Authentication**
3. Click on **Single Sender Verification**

### Step 2: Add Your Email
1. Click **Create New Sender**
2. Fill out the form:
   ```
   From Name: Your App Name (e.g., "CoachApp")
   From Email: me@ian.ng (your actual email)
   Reply To: me@ian.ng (can be same as From Email)
   Company Address: Your address
   City: Your city
   State: Your state/region
   ZIP: Your postal code
   Country: Malaysia
   ```

### Step 3: Verify Email
1. Click **Create**
2. SendGrid will send a verification email to `me@ian.ng`
3. Check your inbox (and spam folder)
4. Click the verification link in the email
5. Status should change to **Verified** ✅

### Step 4: Use in Supabase
- In Supabase SMTP settings, use `me@ian.ng` as your **From Email**

---

## Method 2: Domain Authentication (Recommended)

### Step 1: Access Domain Authentication
1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **Sender Authentication**
3. Click on **Domain Authentication**

### Step 2: Add Your Domain
1. Click **Authenticate Your Domain**
2. Enter your domain (e.g., `ian.ng`)
3. Choose your DNS provider or select "Other" if unsure
4. Select **No** for "Would you also like to brand the links for this domain?"

### Step 3: DNS Configuration
SendGrid will provide DNS records like:
```
Type: CNAME
Name: s1._domainkey.ian.ng
Value: s1.domainkey.u1234567.wl.sendgrid.net

Type: CNAME
Name: s2._domainkey.ian.ng
Value: s2.domainkey.u1234567.wl.sendgrid.net
```

### Step 4: Add DNS Records
**If you manage your own DNS:**
1. Log into your domain registrar (where you bought ian.ng)
2. Find DNS management section
3. Add the CNAME records exactly as provided
4. Wait 24-48 hours for DNS propagation

**If you don't manage DNS:**
- Contact your IT team or domain administrator
- Provide them the DNS records to add

### Step 5: Verify Domain
1. Return to SendGrid after DNS propagation
2. Click **Verify** next to your domain
3. Status should change to **Verified** ✅

---

## How to Check Your Current Status

### Check Single Sender Status
1. Go to **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Look for your email address
3. Status should show **Verified** with a green checkmark

### Check Domain Status
1. Go to **Settings** → **Sender Authentication** → **Domain Authentication**
2. Look for your domain
3. Status should show **Verified** with DNS records confirmed

---

## Troubleshooting Common Issues

### Single Sender Verification

**Issue**: Verification email not received
- Check spam/junk folder
- Ensure email address is typed correctly
- Try resending verification email

**Issue**: Verification link expired
- Request new verification email
- Complete verification within 24 hours

### Domain Authentication

**Issue**: DNS verification failing
- Verify CNAME records are added exactly as provided
- Check for typos in record names/values
- Wait 24-48 hours for DNS propagation
- Use DNS checker tools to verify records are live

**Issue**: DNS records not found
- Contact your domain registrar for help
- Ensure you have access to DNS management
- Consider using Single Sender Verification instead

---

## Testing Your Configuration

### After Single Sender Verification:
```javascript
// In Supabase SMTP settings:
From Email: me@ian.ng  // ✅ Must match verified sender
From Name: CoachApp
```

### After Domain Authentication:
```javascript
// In Supabase SMTP settings:
From Email: noreply@ian.ng  // ✅ Any email on verified domain
From Name: CoachApp
```

---

## Quick Start Recommendation

**For immediate testing**: Use **Single Sender Verification** with `me@ian.ng`

1. Go to SendGrid → Settings → Sender Authentication → Single Sender Verification
2. Create new sender with `me@ian.ng`
3. Verify the email in your inbox
4. Update Supabase SMTP settings to use `me@ian.ng` as From Email
5. Test email delivery

**For production**: Set up **Domain Authentication** for `ian.ng` domain

---

## Visual Guide

```
SendGrid Dashboard
├── Settings
    ├── Sender Authentication
        ├── Single Sender Verification
        │   ├── Create New Sender
        │   ├── Enter: me@ian.ng
        │   ├── Verify email
        │   └── ✅ Status: Verified
        │
        └── Domain Authentication
            ├── Authenticate Your Domain
            ├── Enter: ian.ng
            ├── Get DNS records
            ├── Add to DNS provider
            ├── Wait 24-48 hours
            └── ✅ Status: Verified
```

---

## Next Steps After Verification

1. ✅ Complete sender authentication (this guide)
2. 🔧 Update Supabase SMTP settings with verified sender
3. 🧪 Re-run `node test-sendgrid-smtp.js`
4. 📧 Verify emails arrive at me@ian.ng
5. 🚀 Test complete signup flow in your app

---

**Need Help?**
- SendGrid Support: https://support.sendgrid.com/
- SendGrid Documentation: https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication