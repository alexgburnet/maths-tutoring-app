// src/auth.js
export function getTokenFromCookie() {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? match[2] : null;
  }
  
  export function clearTokenCookie() {
    document.cookie = "token=; Max-Age=0; path=/";
  }