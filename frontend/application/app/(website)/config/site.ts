export const SITE_CONFIG = {
  name: "Techtronix Computer Services", // Replace with your business name
  shortName: "Techtronix",
  description: "Professional desktop repair, hardware upgrades, and Linux systems specialist.",
  
  // Contact & Social Links
  contact: {
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+91 00000 00000",
    phoneRaw: process.env.NEXT_PUBLIC_CONTACT_PHONE_RAW ?? "+910000000000",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@example.com",
    address: "India",               // Update with your local city/area if doorstep service is location-bound
  },

  // WhatsApp CTA Config
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "910000000000",      // Without '+' for wa.me URLs
    defaultMessage: "Hi, I would like to enquire about computer service.",
    get link() {
      return `https://wa.me/${this.number}?text=${encodeURIComponent(this.defaultMessage)}`;
    },
  },

  // Operating parameters
  business: {
    owner: "Abhimanyu Bose",
    startingRateINR: 299,
    formattedStartingRate: "₹299",
    currency: "INR",
    currencySymbol: "₹",
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;