# Setup Instructions for Kutzal Website

## Node.js Version
This project requires Node.js 22 (or 20.9.0+). You've successfully set Node.js 22 as your default.

## Running the Development Server

Always make sure you're using Node.js 22:
```bash
source ~/.nvm/nvm.sh && nvm use 22
npm run dev
```

Or simply (if Node 22 is already active):
```bash
npm run dev
```

The site will be available at: http://localhost:3000

## Tailwind CSS v4 Configuration

This project uses Tailwind CSS v4, which has a different configuration approach:
- No `tailwind.config.ts` file needed
- Configuration is done in `app/globals.css` using `@theme` directive
- Custom colors are defined as CSS variables

## Custom Colors

The grey and olive green palette is defined in `app/globals.css`:

**Olive Green:**
- olive-50 to olive-900 (lightest to darkest)
- Primary: olive-500 (#7d8a6a)
- Dark: olive-700 (#4f5844)

**Grey:**
- grey-50 to grey-900 (lightest to darkest)
- Light: grey-100 (#f3f4f6)
- Dark: grey-800 (#1f2937)

## Customization Checklist

### 1. WhatsApp Number
Edit `components/WhatsAppButton.tsx`:
```typescript
const phoneNumber = '525512345678'; // Replace with your number
```

### 2. Contact Information
Edit `components/Footer.tsx`:
- Email address
- Phone number
- Studio physical address
- Social media links (Facebook, Instagram, TikTok)

### 3. Images
Replace placeholders in:
- Hero section (`app/page.tsx`)
- Logo placeholder
- People/studio images

### 4. Navigation Links
Currently set up:
- Inicio (/)
- Nosotros (/nosotros) - needs to be created
- Clases (/clases) - needs to be created
- Planes (/planes) - needs to be created
- Contacto (/contacto) - needs to be created

## Project Structure

```
kutzal/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles + Tailwind config
├── components/
│   ├── Header.tsx          # Navigation
│   ├── Footer.tsx          # Footer
│   └── WhatsAppButton.tsx  # Floating WhatsApp button
└── public/                 # Static assets (add images here)
```

## Next Steps

You mentioned you'll provide instructions for creating the other pages:
- Nosotros (About)
- Clases (Classes)
- Planes (Plans/Pricing)
- Contacto (Contact)

Ready when you are!