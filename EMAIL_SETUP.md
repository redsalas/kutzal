# Email Notification System - Kutzal

This document explains how to set up and use the email notification system for Kutzal.

## Overview

The email system sends automated notifications for:
1. **Welcome Email** - When a user registers
2. **Plan Purchase Email** - When a user buys a membership plan
3. **Reservation Email** - When a user books a class

## Setup Instructions

### 1. Install Dependencies

Already installed:
- `resend` - Email service provider

### 2. Get Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Supabase Configuration
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key

# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here

# Email sender address (must be verified in Resend)
EMAIL_FROM=Kutzal <noreply@yourdomain.com>

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Verify Your Domain (Production)

For production use:
1. Add your domain in Resend dashboard
2. Add DNS records as instructed
3. Wait for verification
4. Update `EMAIL_FROM` with your verified domain

For development, you can use the default `onboarding@resend.dev` address.

## API Endpoints

### 1. Welcome Email
**Endpoint:** `POST /api/email/welcome`

**Request Body:**
```json
{
  "email": "user@example.com",
  "userName": "John Doe" // optional
}
```

**Usage Example:**
```typescript
await fetch('/api/email/welcome', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com',
    userName: 'John'
  }),
});
```

### 2. Plan Purchase Email
**Endpoint:** `POST /api/email/plan-purchase`

**Request Body:**
```json
{
  "email": "user@example.com",
  "planName": "Plan Mensual",
  "planDetails": {
    "price": "$1,500 MXN",
    "duration": "1 mes",
    "features": [
      "8 clases al mes",
      "Acceso a todas las instalaciones",
      "Asesoría personalizada"
    ]
  }
}
```

**Usage Example:**
```typescript
await fetch('/api/email/plan-purchase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: user.email,
    planName: 'Plan Mensual',
    planDetails: {
      price: '$1,500 MXN',
      duration: '1 mes',
      features: ['8 clases al mes', 'Acceso completo']
    }
  }),
});
```

### 3. Reservation Email
**Endpoint:** `POST /api/email/reservation`

**Request Body:**
```json
{
  "email": "user@example.com",
  "reservationDetails": {
    "className": "Pilates Reformer",
    "date": "25 de Mayo, 2026",
    "time": "10:00 AM",
    "instructor": "María González",
    "location": "Studio Principal"
  }
}
```

**Usage Example:**
```typescript
await fetch('/api/email/reservation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: user.email,
    reservationDetails: {
      className: 'Pilates Reformer',
      date: '25 de Mayo, 2026',
      time: '10:00 AM',
      instructor: 'María González',
      location: 'Studio Principal'
    }
  }),
});
```

## Email Templates

All email templates are located in `lib/email.ts` and include:

### Welcome Email Template
- Kutzal branding
- Welcome message
- Next steps for the user
- Call-to-action button

**TODO Items:**
- [ ] Customize welcome message content
- [ ] Add contact information
- [ ] Add social media links

### Plan Purchase Email Template
- Purchase confirmation
- Plan details (name, price, duration, features)
- Checkmark icon for success

**TODO Items:**
- [ ] Add payment receipt details
- [ ] Add instructions on how to use the plan
- [ ] Add cancellation policy

### Reservation Email Template
- Reservation confirmation
- Class details (name, date, time, instructor, location)
- Reminder to arrive early

**TODO Items:**
- [ ] Add calendar invite attachment
- [ ] Add cancellation policy
- [ ] Add "what to bring" section
- [ ] Add map/directions link

## Customizing Templates

To customize email templates, edit the functions in `lib/email.ts`:

1. `getWelcomeEmailTemplate()` - Welcome email
2. `getPlanPurchaseEmailTemplate()` - Plan purchase email
3. `getReservationEmailTemplate()` - Reservation email

Each template uses inline CSS for maximum email client compatibility.

## Integration Examples

### When User Registers (Already Implemented)
The welcome email is automatically sent when a user signs up in `app/login/page.tsx`.

### When User Purchases a Plan (To Implement)
```typescript
// In your plan purchase handler
const handlePlanPurchase = async (planId: string) => {
  // Process payment...
  
  // Send confirmation email
  await fetch('/api/email/plan-purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      planName: selectedPlan.name,
      planDetails: {
        price: selectedPlan.price,
        duration: selectedPlan.duration,
        features: selectedPlan.features
      }
    }),
  });
};
```

### When User Makes a Reservation (To Implement)
```typescript
// In your reservation handler
const handleReservation = async (classId: string, dateTime: Date) => {
  // Create reservation in database...
  
  // Send confirmation email
  await fetch('/api/email/reservation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      reservationDetails: {
        className: classInfo.name,
        date: formatDate(dateTime),
        time: formatTime(dateTime),
        instructor: classInfo.instructor,
        location: classInfo.location
      }
    }),
  });
};
```

## Testing

### Development Testing
1. Use Resend's test mode (free tier)
2. Emails will be sent to your verified email addresses
3. Check Resend dashboard for email logs

### Production Testing
1. Verify your domain in Resend
2. Test with real user emails
3. Monitor email delivery rates in Resend dashboard

## Troubleshooting

### Email Not Sending
- Check RESEND_API_KEY is set correctly
- Verify EMAIL_FROM address is valid
- Check Resend dashboard for error logs
- Ensure API route is accessible

### Email Goes to Spam
- Verify your domain in Resend
- Add SPF and DKIM records
- Use a professional email address
- Avoid spam trigger words

### Template Not Rendering
- Check HTML syntax in template
- Test with different email clients
- Use inline CSS only
- Avoid complex layouts

## Support

For issues with:
- **Resend Service:** [https://resend.com/docs](https://resend.com/docs)
- **Email Templates:** Edit `lib/email.ts`
- **API Routes:** Check `app/api/email/*/route.ts`

## Next Steps

1. ✅ Set up Resend account and get API key
2. ✅ Add environment variables
3. ⏳ Customize email templates (marked with TODO comments)
4. ⏳ Implement plan purchase email trigger
5. ⏳ Implement reservation email trigger
6. ⏳ Test all email flows
7. ⏳ Verify domain for production use