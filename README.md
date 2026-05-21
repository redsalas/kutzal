# Kutzal - Pilates Clásico

A modern Next.js website for Kutzal Pilates Studio, featuring a clean design with grey and olive green color palette.

## Features

- ✅ Responsive design with mobile navigation
- ✅ Grey and olive green color scheme
- ✅ WhatsApp integration for easy contact
- ✅ Image placeholders ready for your content
- ✅ Modern layout with hero section
- ✅ Footer with social media links
- ✅ Navigation menu (Inicio, Nosotros, Clases, Planes, Contacto)

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Customization

### WhatsApp Number
Update the phone number in `components/WhatsAppButton.tsx`:
```typescript
const phoneNumber = '525512345678'; // Replace with your actual WhatsApp number
```

### Contact Information
Update contact details in `components/Footer.tsx`:
- Email address
- Phone number
- Studio address
- Social media links

### Colors
The color palette is defined in `tailwind.config.ts`:
- Olive green shades (olive-50 to olive-900)
- Grey shades (grey-50 to grey-900)

### Images
Replace the placeholder sections with your actual images:
- Hero section background
- Logo placeholder
- People/studio images

## Project Structure

```
kutzal/
├── app/
│   ├── layout.tsx          # Root layout with Header, Footer, WhatsApp button
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Navigation header
│   ├── Footer.tsx          # Footer with contact info
│   └── WhatsAppButton.tsx  # Floating WhatsApp button
└── tailwind.config.ts      # Tailwind configuration with custom colors
```

## Next Steps

The following pages need to be created:
- `/nosotros` - About page
- `/clases` - Classes page
- `/planes` - Plans/pricing page
- `/contacto` - Contact page
- `/inscribirme` - Sign up page

## Technologies

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Google Fonts (Inter)

## License

Private project for Kutzal Pilates Studio
