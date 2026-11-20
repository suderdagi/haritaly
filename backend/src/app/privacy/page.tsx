import type { Metadata } from 'next';
import { ContactEmail } from '@/src/components/ContactEmail';
import { site } from '@/src/lib/site';

export const metadata: Metadata = { title: 'Privacy Policy' };

// Keep this page in sync with what the code actually does. App Review compares the two.
export default function PrivacyPage() {
  return (
    <main className="page">
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated: {site.legalUpdatedAt}</p>
      <div className="lang-switch">
        <a href="#en">English</a>
        <a href="#tr">Türkçe</a>
      </div>

      <section id="en" lang="en" className="lang-block">
        <p>
          {site.appName} is a social map app developed and operated by {site.developer} (“we”, “us”). This policy explains
          what data the app collects, why, who can see it and how you can delete it. Contact: <ContactEmail />
        </p>

        <h2>Data we collect</h2>
        <h3>Account</h3>
        <p>
          Your email address, your password (we only store a one-way bcrypt hash, never the password itself), and the
          first name, last name and bio you choose to add.
        </p>
        <h3>Places you save</h3>
        <p>
          The name, category, address, rating, notes, favorite food and drink, the photos you attach, and the coordinates
          of the place.
        </p>
        <h3>Friends and safety</h3>
        <p>Friend requests and friendships, your favorites, the users you block and the reports you send.</p>
        <h3>Location</h3>
        <p>
          With your permission, the app uses your device’s precise location while you are using it: to center the map,
          to store the coordinates of a place when you save it where you are, and to load your friends’ places in the
          area shown on the map. The map area is sent to our server only to answer that request and is not stored. We
          don’t use your location in the background and we don’t keep a location history.
        </p>
        <h3>Technical data</h3>
        <p>
          Like any web service, our hosting provider records standard request logs (such as IP address, time and
          requested address) for security and debugging. They are kept for a short time.
        </p>

        <h2>How we use it</h2>
        <p>
          Only to provide the app’s features. We do not sell your data, we do not show ads, and we do not track you
          across other companies’ apps or websites.
        </p>

        <h2>Who can see your data</h2>
        <ul>
          <li>Your places, notes, ratings and photos are shown only to you and the people you accept as friends.</li>
          <li>
            Other signed-in users can find you by name or email address so they can send you a friend request. Search
            results show your name, email address and bio.
          </li>
          <li>
            Photos are stored under random, hard-to-guess links. In the app they are shown only to you and your friends,
            but anyone who is given the exact link can open it.
          </li>
          <li>If you block someone, you stop being friends and you no longer see each other in search.</li>
        </ul>

        <h2>AI summaries (OpenAI)</h2>
        <p>
          A place can show a short “What friends say” summary. It is created only when you tap <em>Summarize with AI</em>{' '}
          and agree to the explanation shown in the app. We then send the ratings, notes, descriptions and favorite food
          and drink that you and your friends saved for that place to OpenAI, which writes the summary. Names, email
          addresses and photos are not sent: entries are labeled “Friend 1”, “Friend 2” and so on. Your own entries can be
          part of a summary that one of your friends requests for the same place. Summaries are cached on our server and
          deleted when any account is deleted. OpenAI processes this data as our service provider under its API terms.
        </p>

        <h2>Service providers</h2>
        <ul>
          <li>Vercel Inc. — hosting of the server and storage of photos</li>
          <li>Neon — database hosting</li>
          <li>OpenAI — AI summaries, only when you request one</li>
        </ul>
        <p>
          Our server and database are hosted in the European Union (Frankfurt, Germany). Service providers may process
          some data in other countries, including the United States, with appropriate safeguards.
        </p>

        <h2>How long we keep data and how to delete it</h2>
        <p>
          We keep your data until you delete it. Deleting a place also deletes its photos. You can delete your account at
          any time in the app under <strong>Profile → Delete account</strong>. This permanently deletes your account,
          places, photos, friendships, favorites, blocks and reports right away. Database backups kept by our provider for
          disaster recovery are overwritten within a few days. You can also ask us to delete your data by email.
        </p>

        <h2>Your rights</h2>
        <p>
          You can view and edit your data in the app, delete it, and contact us to request a copy, a correction or a
          deletion, or to object to processing. These rights apply under the Turkish Personal Data Protection Law (KVKK,
          No. 6698), the EU GDPR and similar laws. Write to <ContactEmail />.
        </p>

        <h2>Children</h2>
        <p>{site.appName} is not intended for children under 13, and we do not knowingly collect their data.</p>

        <h2>Security</h2>
        <p>
          All traffic is encrypted with HTTPS, passwords are hashed with bcrypt, and every request is checked so that you
          can only see your own and your friends’ places.
        </p>

        <h2>Changes</h2>
        <p>If this policy changes, we will update this page and the date at the top.</p>
      </section>

      <section id="tr" lang="tr" className="lang-block">
        <h2>Gizlilik Politikası (Türkçe)</h2>
        <p>
          {site.appName}, {site.developer} tarafından geliştirilen ve işletilen bir sosyal harita uygulamasıdır. Bu metin,
          uygulamanın hangi verileri neden topladığını, kimlerin görebildiğini ve verilerinizi nasıl silebileceğinizi
          açıklar. İletişim: <ContactEmail />
        </p>

        <h3>Topladığımız veriler</h3>
        <ul>
          <li>
            <strong>Hesap:</strong> e-posta adresiniz, şifreniz (şifrenin kendisini değil, yalnızca tek yönlü bcrypt
            özetini saklarız) ve eklemeyi seçtiğiniz ad, soyad ve biyografi.
          </li>
          <li>
            <strong>Kaydettiğiniz yerler:</strong> ad, kategori, adres, puan, notlar, favori yemek ve içecek, eklediğiniz
            fotoğraflar ve yerin koordinatları.
          </li>
          <li>
            <strong>Arkadaşlar ve güvenlik:</strong> arkadaşlık istekleri ve arkadaşlıklar, favorileriniz, engellediğiniz
            kullanıcılar ve gönderdiğiniz şikâyetler.
          </li>
          <li>
            <strong>Konum:</strong> İzin verirseniz uygulama, siz kullanırken cihazınızın hassas konumunu haritayı
            ortalamak, bulunduğunuz yerde kaydettiğiniz yerin koordinatlarını saklamak ve haritada görünen bölgedeki
            arkadaş yerlerini yüklemek için kullanır. Harita bölgesi sunucuya yalnızca bu istek için gönderilir ve
            saklanmaz. Konumunuzu arka planda kullanmayız ve konum geçmişi tutmayız.
          </li>
          <li>
            <strong>Teknik veriler:</strong> Barındırma sağlayıcımız güvenlik ve hata ayıklama için standart istek
            kayıtları (IP adresi, zaman, istenen adres gibi) tutar. Bu kayıtlar kısa süre saklanır.
          </li>
        </ul>

        <h3>Verileri nasıl kullanıyoruz</h3>
        <p>
          Yalnızca uygulamanın özelliklerini sunmak için. Verilerinizi satmayız, reklam göstermeyiz ve sizi başka
          şirketlerin uygulama ve sitelerinde takip etmeyiz.
        </p>

        <h3>Verilerinizi kimler görebilir</h3>
        <ul>
          <li>Yerleriniz, notlarınız, puanlarınız ve fotoğraflarınız yalnızca size ve arkadaş olarak kabul ettiğiniz kişilere gösterilir.</li>
          <li>
            Giriş yapmış diğer kullanıcılar size arkadaşlık isteği gönderebilmek için sizi ad veya e-posta adresinizle
            bulabilir. Arama sonuçlarında adınız, e-posta adresiniz ve biyografiniz görünür.
          </li>
          <li>
            Fotoğraflar rastgele, tahmin edilmesi zor bağlantılarla saklanır. Uygulamada yalnızca size ve
            arkadaşlarınıza gösterilir, ancak bağlantının tam adresi kendisine verilen biri onu açabilir.
          </li>
          <li>Birini engellerseniz arkadaşlığınız sona erer ve aramada birbirinizi artık görmezsiniz.</li>
        </ul>

        <h3>Yapay zekâ özetleri (OpenAI)</h3>
        <p>
          Bir yer için kısa bir “What friends say” özeti oluşturulabilir. Özet yalnızca siz <em>Summarize with AI</em>{' '}
          düğmesine dokunup uygulamada gösterilen açıklamayı onayladığınızda oluşturulur. Bu durumda sizin ve
          arkadaşlarınızın o yer için kaydettiği puanlar, notlar, açıklamalar ve favori yemek ve içecekler özeti yazması
          için OpenAI’a gönderilir. Ad, e-posta ve fotoğraf gönderilmez; kayıtlar “Friend 1”, “Friend 2” gibi
          etiketlenir. Arkadaşlarınızdan biri aynı yer için özet istediğinde sizin kayıtlarınız da özete dahil olabilir.
          Özetler sunucumuzda önbelleğe alınır ve herhangi bir hesap silindiğinde silinir. OpenAI bu verileri API
          koşulları kapsamında hizmet sağlayıcımız olarak işler.
        </p>

        <h3>Hizmet sağlayıcılar</h3>
        <p>
          Vercel Inc. (sunucunun barındırılması ve fotoğrafların saklanması), Neon (veritabanı) ve OpenAI (yalnızca özet
          istediğinizde). Sunucumuz ve veritabanımız Avrupa Birliği’nde (Frankfurt, Almanya) barındırılır. Hizmet
          sağlayıcılar bazı verileri ABD dahil başka ülkelerde, uygun güvencelerle işleyebilir.
        </p>

        <h3>Saklama süresi ve silme</h3>
        <p>
          Verilerinizi siz silene kadar saklarız. Bir yeri silmek fotoğraflarını da siler. Hesabınızı uygulamada istediğiniz
          zaman <strong>Profile → Delete account</strong> bölümünden silebilirsiniz. Bu işlem hesabınızı, yerlerinizi,
          fotoğraflarınızı, arkadaşlıklarınızı, favorilerinizi, engellemelerinizi ve şikâyetlerinizi hemen ve kalıcı olarak
          siler. Sağlayıcımızın felaket kurtarma için tuttuğu veritabanı yedekleri birkaç gün içinde üzerine yazılır.
          Verilerinizin silinmesini e-postayla da isteyebilirsiniz.
        </p>

        <h3>Haklarınız</h3>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve benzeri mevzuat kapsamında verilerinize erişme,
          düzeltilmesini, silinmesini veya bir kopyasını isteme ve işlenmesine itiraz etme haklarına sahipsiniz.
          Başvurularınız için: <ContactEmail />
        </p>

        <h3>Çocuklar</h3>
        <p>{site.appName} 13 yaşından küçük çocuklara yönelik değildir ve bilerek onların verilerini toplamayız.</p>

        <h3>Güvenlik</h3>
        <p>
          Tüm trafik HTTPS ile şifrelenir, şifreler bcrypt ile özetlenir ve her istekte yalnızca kendi yerlerinizi ve
          arkadaşlarınızın yerlerini görebildiğiniz kontrol edilir.
        </p>

        <h3>Değişiklikler</h3>
        <p>Bu politika değişirse bu sayfayı ve en üstteki tarihi güncelleriz. Son güncelleme: {site.legalUpdatedAtTr}.</p>
      </section>
    </main>
  );
}
