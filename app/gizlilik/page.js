import Nav from "../components/Nav";

export const metadata = {
  title: "KVKK Aydınlatma Metni — NutriAI",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-basil-900 mb-2">
          KVKK Aydınlatma Metni
        </h1>
        <p className="text-sm text-ink-soft mb-8">Son güncelleme: {new Date().toLocaleDateString("tr-TR")}</p>

        <div className="space-y-6 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="font-display font-bold text-basil-900 mb-2">1. Veri Sorumlusu</h2>
            <p>
              Bu uygulama ("NutriAI") kapsamında işlenen kişisel verileriniz, 6698 sayılı Kişisel
              Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla uygulama
              geliştiricisi tarafından işlenmektedir. Bu metin bir staj/eğitim projesi kapsamında
              hazırlanmış genel bir bilgilendirmedir.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-basil-900 mb-2">2. İşlenen Kişisel Veriler</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Kimlik ve iletişim verileri: e-posta adresi</li>
              <li>
                Sağlık ve fiziksel özellik verileri: yaş, cinsiyet, boy, kilo, bel/boyun/kalça ölçüleri,
                hesaplanan BMI ve tahmini vücut yağ oranı, aktivite seviyesi, beslenme hedefi,
                kısıtlama/alerji bilgileri
              </li>
              <li>Uygulama kullanım verileri: sohbet geçmişi, oluşturulan yemek/spor önerileri</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-basil-900 mb-2">3. İşleme Amaçları</h2>
            <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Hesabınızın oluşturulması ve kimlik doğrulaması</li>
              <li>Size özel beslenme ve spor önerileri oluşturulması</li>
              <li>Vücut kitle indeksi ve tahmini yağ oranının hesaplanması</li>
              <li>Sohbet geçmişinizin saklanıp size gösterilebilmesi</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-basil-900 mb-2">4. Verilerin Aktarımı</h2>
            <p>
              Girdiğiniz bilgiler; hesap/veritabanı altyapısı için Supabase, kişiselleştirilmiş
              öneri üretimi için ise Google Gemini API hizmet sağlayıcılarına, yalnızca hizmetin
              çalışabilmesi için gerekli ölçüde iletilir. Verileriniz reklam amacıyla üçüncü
              taraflarla paylaşılmaz veya satılmaz.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-basil-900 mb-2">5. Hukuki Sebep ve Açık Rıza</h2>
            <p>
              Sağlığa ilişkin verileriniz (boy, kilo, vücut ölçüleri, hedefleriniz) KVKK kapsamında
              hassas nitelikte değerlendirilebileceğinden, bu veriler yalnızca <strong>açık rızanız</strong>{" "}
              ile ve kayıt sırasında onayladığınız ölçüde işlenir. Diğer veriler ise hizmetin
              sunulabilmesi için gerekli olması hukuki sebebine dayanır.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-basil-900 mb-2">6. Haklarınız</h2>
            <p>KVKK'nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını öğrenme, yurt içinde/dışında aktarıldığı üçüncü kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, silinmesini/yok edilmesini isteme ve bu işlemlerin aktarıldığı kişilere bildirilmesini isteme haklarına sahipsiniz.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-basil-900 mb-2">7. Veri Saklama ve Silme</h2>
            <p>
              Hesabınızı sildiğinizde, ilişkili profil ve sohbet verileriniz sistemden kaldırılır.
              Hesap silme talebiniz için uygulama içinden veya bize ulaşarak talepte bulunabilirsiniz.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}