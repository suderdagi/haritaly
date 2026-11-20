import { site } from '@/src/lib/site';

/** Support email link. Shows a visible warning if SUPPORT_EMAIL was not set at build time. */
export function ContactEmail() {
  if (!site.supportEmail) {
    return <span className="notice">Contact email not configured (set SUPPORT_EMAIL)</span>;
  }
  return <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>;
}
