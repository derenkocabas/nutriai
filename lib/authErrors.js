export function translateAuthError(message) {
  if (!message) return "Bir şeyler ters gitti, lütfen tekrar dene.";
  const m = message.toLowerCase();

  if (m.includes("rate limit")) {
    return "Çok fazla deneme yapıldı. Lütfen bir süre bekleyip tekrar dene.";
  }
  if (m.includes("already registered") || m.includes("already exists") || m.includes("user already")) {
    return "Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı dener misin?";
  }
  if (m.includes("invalid login credentials") || m.includes("invalid email or password")) {
    return "E-posta veya şifre hatalı.";
  }
  if (m.includes("email not confirmed")) {
    return "E-postanı henüz onaylamadın. Gelen kutunu (ve spam klasörünü) kontrol eder misin?";
  }
  if (m.includes("password") && m.includes("least")) {
    return "Şifre en az 6 karakter olmalı.";
  }
  if (m.includes("invalid email")) {
    return "Geçerli bir e-posta adresi gir.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Bağlantı sorunu oluştu. İnternetini kontrol edip tekrar dener misin?";
  }

  return "Bir şeyler ters gitti, lütfen tekrar dene.";
}