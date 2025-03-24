// src/services/auth.js
export function getTokenFromCookie() {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
}

export function clearTokenCookie() {
  document.cookie = 'token=; Max-Age=0; path=/';
}

export function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function isUserAdmin() {
  try {
    const token = getTokenFromCookie();
    if (!token) return false;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.is_admin === true;
  } catch {
    return false;
  }
}

export function getUserInfo() {
  try {
    const token = getTokenFromCookie();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}