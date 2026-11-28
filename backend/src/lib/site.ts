/** Details shown on the public web pages (privacy policy, terms, support). */
export const site = {
  appName: 'Haritaly',
  developer: 'Sude Erdağı',
  /** Set SUPPORT_EMAIL in the hosting environment. The App Store requires a way to contact the developer. */
  supportEmail: process.env.SUPPORT_EMAIL || null,
  /** Update this date whenever the privacy policy or the terms change. */
  legalUpdatedAt: '28 November 2026',
  legalUpdatedAtTr: '28 Kasım 2026',
};
