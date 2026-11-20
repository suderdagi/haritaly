import type { Metadata } from 'next';
import { ContactEmail } from '@/src/components/ContactEmail';
import { site } from '@/src/lib/site';

export const metadata: Metadata = { title: 'Terms of Use' };

export default function TermsPage() {
  return (
    <main className="page">
      <h1>Terms of Use</h1>
      <p className="updated">Last updated: {site.legalUpdatedAt}</p>
      <div className="lang-switch">
        <a href="#en">English</a>
        <a href="#tr">Türkçe</a>
      </div>

      <section id="en" lang="en" className="lang-block">
        <p>
          These terms apply to the {site.appName} app and service, operated by {site.developer}. By creating an account
          you agree to them and to the <a href="/privacy">Privacy Policy</a>.
        </p>

        <h2>Your account</h2>
        <p>
          You must be at least 13 years old. Give accurate information, keep your password private, and don’t create
          accounts for other people. You can delete your account at any time in the app.
        </p>

        <h2>Your content</h2>
        <p>
          You own the places, notes and photos you add. You allow us to store them and show them to you and your friends
          so the app can work. You are responsible for what you post and must have the right to share it.
        </p>

        <h2>No tolerance for objectionable content or abusive users</h2>
        <p>You must not use {site.appName} to post or send content that:</p>
        <ul>
          <li>is hateful, harassing, threatening, bullying or discriminatory;</li>
          <li>is sexually explicit, violent or otherwise objectionable;</li>
          <li>is illegal, promotes illegal activity, or infringes someone else’s rights or privacy;</li>
          <li>is spam, misleading, or impersonates another person.</li>
        </ul>
        <p>
          You can report a place from its page and block any user. We review reports within 24 hours. We remove content
          that breaks these rules and may suspend or delete the accounts that posted it, without notice.
        </p>

        <h2>AI summaries</h2>
        <p>
          AI summaries are generated automatically from what you and your friends saved. They can be incomplete or wrong,
          so don’t rely on them for important decisions.
        </p>

        <h2>The service</h2>
        <p>
          {site.appName} is provided “as is”, free of charge, without warranties. We may change or discontinue features.
          To the extent permitted by law, we are not liable for indirect damages or for losses caused by content posted by
          other users.
        </p>

        <h2>App Store</h2>
        <p>
          If you downloaded the app from Apple’s App Store, Apple’s Standard End User License Agreement also applies.
          Apple is not responsible for the app or its content.
        </p>

        <h2>Changes and contact</h2>
        <p>
          If these terms change, we will update this page. These terms are governed by the laws of the Republic of Türkiye.
          Questions: <ContactEmail />
        </p>
      </section>

      <section id="tr" lang="tr" className="lang-block">
        <h2>Kullanım Koşulları (Türkçe)</h2>
        <p>
          Bu koşullar {site.developer} tarafından işletilen {site.appName} uygulaması ve hizmeti için geçerlidir. Hesap
          oluşturarak bu koşulları ve <a href="/privacy">Gizlilik Politikası</a>’nı kabul etmiş olursunuz.
        </p>

        <h3>Hesabınız</h3>
        <p>
          En az 13 yaşında olmalısınız. Doğru bilgi verin, şifrenizi kimseyle paylaşmayın ve başkası adına hesap açmayın.
          Hesabınızı uygulamadan istediğiniz zaman silebilirsiniz.
        </p>

        <h3>İçerikleriniz</h3>
        <p>
          Eklediğiniz yerler, notlar ve fotoğraflar size aittir. Uygulamanın çalışabilmesi için bunları saklamamıza ve size
          ve arkadaşlarınıza göstermemize izin verirsiniz. Paylaştıklarınızdan siz sorumlusunuz ve paylaşma hakkına sahip
          olmalısınız.
        </p>

        <h3>Uygunsuz içeriğe ve taciz eden kullanıcılara sıfır tolerans</h3>
        <p>
          {site.appName}’yi nefret söylemi, taciz, tehdit, zorbalık veya ayrımcılık içeren; müstehcen, şiddet içeren ya da
          başka şekilde uygunsuz; yasa dışı veya başkalarının haklarını ihlal eden; spam, yanıltıcı ya da başkasını taklit
          eden içerik paylaşmak için kullanamazsınız. Bir yeri kendi sayfasından şikâyet edebilir ve herhangi bir
          kullanıcıyı engelleyebilirsiniz. Şikâyetleri 24 saat içinde inceleriz; kurallara aykırı içeriği kaldırır, bu
          içeriği paylaşan hesapları önceden bildirimde bulunmadan askıya alabilir veya silebiliriz.
        </p>

        <h3>Yapay zekâ özetleri</h3>
        <p>
          Özetler sizin ve arkadaşlarınızın kaydettiklerinden otomatik olarak oluşturulur. Eksik veya hatalı olabilirler;
          önemli kararlarınızı bunlara dayandırmayın.
        </p>

        <h3>Hizmet</h3>
        <p>
          {site.appName} ücretsizdir ve “olduğu gibi”, herhangi bir garanti verilmeden sunulur. Özellikleri değiştirebilir
          veya kaldırabiliriz. Yasaların izin verdiği ölçüde dolaylı zararlardan ve diğer kullanıcıların paylaştığı
          içeriklerden doğan kayıplardan sorumlu değiliz.
        </p>

        <h3>App Store</h3>
        <p>
          Uygulamayı Apple’ın App Store’undan indirdiyseniz Apple’ın Standart Son Kullanıcı Lisans Sözleşmesi de geçerlidir.
          Apple uygulamadan ve içeriğinden sorumlu değildir.
        </p>

        <h3>Değişiklikler ve iletişim</h3>
        <p>
          Bu koşullar değişirse bu sayfayı güncelleriz. Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır. Sorularınız
          için: <ContactEmail />
        </p>
      </section>
    </main>
  );
}
