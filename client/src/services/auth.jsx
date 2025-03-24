// src/services/auth.js

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
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
    const token = getAccessToken();
    if (!token || !isTokenValid(token)) return false;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.is_admin === true;
  } catch {
    return false;
  }
}

export function getUserInfo() {
  try {
    const token = getAccessToken();
    if (!token || !isTokenValid(token)) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}