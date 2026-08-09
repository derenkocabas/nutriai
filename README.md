# NutriAI — AI Diyetisyen Webapp

3 haftalık internship projesi. Next.js + Supabase + Google Gemini API ile,
tamamen ücretsiz araçlar kullanılarak inşa edilmektedir.

## Bu scaffold'da neler var (Hafta 1 kapsamı)

- Ana sayfa (landing)
- Kayıt / Giriş (Supabase Auth)
- Onboarding formu: yaş, cinsiyet, boy, kilo, aktivite, hedef, kısıtlamalar
- Canlı BMI hesaplama + isteğe bağlı yağ oranı tahmini (US Navy metodu)
- Panel (dashboard): kaydedilen profilin özeti, yemek/spor listesi için "yakında" alanları

Yemek listesi, spor listesi ve AI sohbet (Gemini entegrasyonu) Hafta 2'de eklenecek.

## Kurulum

### 1. Bağımlılıkları yükle
```bash
npm install
```

### 2. Supabase projesi oluştur
1. [supabase.com](https://supabase.com) üzerinden ücretsiz bir proje oluştur.
2. **Project Settings > API** sayfasından `Project URL` ve `anon public` anahtarını al.
3. **SQL Editor**'e git, `supabase/schema.sql` dosyasının içeriğini yapıştırıp çalıştır
   (bu, `profiles` tablosunu ve güvenlik kurallarını oluşturur).

### 3. Ortam değişkenlerini ayarla
```bash
cp .env.local.example .env.local
```
`.env.local` dosyasını açıp Supabase URL/anon key'ini gir. `GEMINI_API_KEY` alanını
şimdilik boş bırakabilirsin — Hafta 2'de kullanılacak.

### 4. Geliştirme sunucusunu başlat
```bash
npm run dev
```
Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini aç.

### 5. Dene
1. `/signup` üzerinden bir hesap oluştur (Supabase'te e-posta onayı açıksa, gelen
   maildeki bağlantıya tıklaman gerekir — Supabase Dashboard > Authentication >
   Providers üzerinden bunu kapatıp test sürecini hızlandırabilirsin).
2. Giriş yap, `/onboarding` üzerinden profilini oluştur.
3. `/dashboard` sayfasında kaydedilen BMI/yağ oranı özetini gör.

## Yayına alma (Vercel)

1. Bu projeyi bir GitHub reposuna push'la.
2. [vercel.com](https://vercel.com) üzerinden GitHub reponu bağla.
3. Environment Variables kısmına `.env.local` içindeki değerlerin aynısını gir.
4. Deploy et.

## Sıradaki adımlar (Hafta 2)

- `GEMINI_API_KEY` ile bir Next.js API route (`/api/chat`, `/api/meal-plan`,
  `/api/workout-plan`) oluşturup Gemini API'yi çağırmak
- Dashboard'daki "yakında" kutularını gerçek AI çıktılarıyla doldurmak
- Basit bir sohbet arayüzü eklemek

## Tasarım notları

Renk paleti ve tipografi, proje planı PDF'iyle tutarlı olacak şekilde bilinçli
seçildi (basil yeşili + amber vurgu, Space Grotesk + Inter). `app/globals.css`
içinde `@theme inline` altında tanımlı.
