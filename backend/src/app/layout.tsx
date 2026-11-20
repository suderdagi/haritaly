import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/src/lib/site';
import './globals.css';

export const metadata: Metadata = {
  title: { default: site.appName, template: `%s · ${site.appName}` },
  description: 'Save the places you love and see the ones your friends recommend.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav>
            <Link href="/" className="logo">
              Harita<span>ly</span>
            </Link>
            <Link href="/support">Support</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Use</Link>
          <Link href="/support">Support</Link>
          <p>
            © 2026 {site.developer}
          </p>
        </footer>
      </body>
    </html>
  );
}
