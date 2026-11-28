import Link from 'next/link';
import { site } from '@/src/lib/site';

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <h1>{site.appName}</h1>
        <p>Save the places you love, with notes and photos, and see the ones your friends recommend around you.</p>
      </section>

      <section className="features">
        <div>
          <h3>Your map</h3>
          <p className="muted">Save the cafés, parks and restaurants you love, with notes, your favorite dish and photos.</p>
        </div>
        <div>
          <h3>Friends only</h3>
          <p className="muted">Your places are visible only to you and the friends you accept. No public feed, no ads.</p>
        </div>
        <div>
          <h3>What friends say</h3>
          <p className="muted">Get a short AI summary of what you and your friends wrote about the same place.</p>
        </div>
      </section>

      <p className="muted" style={{ marginTop: 32 }}>
        Questions? Visit <Link href="/support">Support</Link>. Read the <Link href="/privacy">Privacy Policy</Link> and the{' '}
        <Link href="/terms">Terms of Use</Link>.
      </p>
    </main>
  );
}
