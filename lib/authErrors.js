export function translateAuthError(message) {
  if (!message) return "Bir şeyler ters gitti, lütfen tekrar dene.";
  const m = message.toLowerCase();

  if (m.includes("rate limit")) {
    return "Çok fazla deneme yapıldı. Lütfen bir süre bekleyip tekrar dene.";
  }
  if (
    (m.includes("already") && m.includes("regist")) ||
    m.includes("already exists") ||
    m.includes("user already") ||
    m.includes("duplicate")
  ) {
    return "Bu kullanıcı adı zaten alınmış. Giriş yapmayı dener misin?";
  }
  if (m.includes("invalid login credentials") || m.includes("invalid email or password")) {
    return "Kullanıcı adı veya şifre hatalı.";
  }
  if (m.includes("email not confirmed")) {
    return "Hesabın henüz aktif değil. Lütfen tekrar dene.";
  }
  if (m.includes("password") && (m.includes("least") || m.includes("short") || m.includes("6 charact"))) {
    return "Şifre en az 6 karakter olmalı.";
  }
  if (m.includes("invalid email") || m.includes("unable to validate email")) {
    return "Kullanıcı adı geçersiz karakterler içeriyor, sadece harf/rakam kullan.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Bağlantı sorunu oluştu. İnternetini kontrol edip tekrar dener misin?";
  }

  return "Bir şeyler ters gitti, lütfen tekrar dene.";
}