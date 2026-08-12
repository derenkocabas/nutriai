const FAKE_DOMAIN = "nutriai.local";

export function usernameToEmail(username) {
  const clean = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
  return `${clean}@${FAKE_DOMAIN}`;
}

export function isValidUsername(username) {
  const clean = username.trim();
  return clean.length >= 3 && /^[a-zA-Z0-9._-]+$/.test(clean);
}