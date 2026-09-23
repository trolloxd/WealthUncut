export const SITE = {
  name: 'WealthUncut',
  url: 'https://wealthuncut.com',
  locale: 'es-ES',
  tagline: 'Finanzas prácticas para jóvenes en España, sin humo.',
  // Reenvía al gmail de David mediante Cloudflare Email Routing (configurado el 2026-09-23).
  email: 'contacto@wealthuncut.com',
  description:
    'Herramientas y artículos sobre cuentas, brokers, fondos indexados e impuestos para gestionar tu dinero con datos propios, no con suposiciones.',
} as const;

export const AUTHOR = {
  name: 'David Pérez Mitjà',
  slug: 'david-perez-mitja',
  bio:
    'Formación en International Business y experiencia en finanzas. Escribo sobre cuentas, brokers, fondos indexados e impuestos con datos verificables, no con recomendaciones personalizadas.',
  // TODO(david): sustituir por las cuentas reales antes de publicar.
  twitter: '',
  linkedin: '',
} as const;
