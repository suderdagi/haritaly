import type { Metadata } from 'next';
import { ContactEmail } from '@/src/components/ContactEmail';
import { site } from '@/src/lib/site';

export const metadata: Metadata = { title: 'Support' };

export default function SupportPage() {
  return (
    <main className="page">
      <h1>Support</h1>
      <p>
        Need help with {site.appName}, found a bug, or want to report a user? Email <ContactEmail />. We usually reply
        within 24 hours.
      </p>

      <h2>Frequently asked questions</h2>

      <h3>How do I add a friend?</h3>
      <p>Open the Friends tab, search for their name or email and tap Add. Their places appear on your map once they accept.</p>

      <h3>Who can see my places?</h3>
      <p>Only you and the friends you accepted. There is no public profile or feed.</p>

      <h3>How do I report a place or block someone?</h3>
      <p>
        Open the place and tap the flag icon to report it or block the person who saved it. You can also block a friend
        from the Friends tab with the ⋮ button. Blocked users are listed under Profile → Blocked users, where you can
        unblock them.
      </p>

      <h3>How do I delete my account?</h3>
      <p>
        Go to Profile → Delete account and enter your password. Your account and all your places, photos and friendships
        are deleted permanently. If you can’t open the app, email us from the address you signed up with and we will
        delete it for you.
      </p>

      <h3>Why does the app ask for my location?</h3>
      <p>
        To center the map on you, to save a place where you are standing and to show your friends’ places nearby. The
        app only uses your location while it is open. You can change this any time in the iPhone Settings app.
      </p>

      <section lang="tr" className="lang-block">
        <h2>Destek (Türkçe)</h2>
        <p>
          Yardıma mı ihtiyacınız var, bir hata mı buldunuz ya da bir kullanıcıyı mı şikâyet etmek istiyorsunuz?{' '}
          <ContactEmail /> adresine yazın; genellikle 24 saat içinde yanıt veririz.
        </p>
        <ul>
          <li>
            <strong>Hesap silme:</strong> Profile → Delete account bölümünde şifrenizi girin. Hesabınız ve tüm yerleriniz,
            fotoğraflarınız ve arkadaşlıklarınız kalıcı olarak silinir.
          </li>
          <li>
            <strong>Şikâyet ve engelleme:</strong> Bir yerin sayfasındaki bayrak simgesiyle yeri şikâyet edebilir veya
            kaydeden kişiyi engelleyebilirsiniz. Engellediğiniz kişileri Profile → Blocked users bölümünde görebilir ve
            engeli kaldırabilirsiniz.
          </li>
          <li>
            <strong>Konum:</strong> Haritayı size göre ortalamak, bulunduğunuz yeri kaydetmek ve yakındaki arkadaş yerlerini
            göstermek için yalnızca uygulama açıkken kullanılır.
          </li>
        </ul>
      </section>
    </main>
  );
}
