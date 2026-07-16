import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://hackathon-1096467060974.asia-northeast3.run.app';

export function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = base64.replace(/=+$/, '');
    let output = '';
    if (str.length % 4 === 1) {
      return null;
    }
    for (
      let bc = 0, bs = 0, buffer, idx = 0;
      (buffer = str.charAt(idx++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer),
        bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    return JSON.parse(decodeURIComponent(escape(output)));
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const accessToken = await SecureStore.getItemAsync('accessToken');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // throw custom error with status and data
    throw {
      status: response.status,
      data,
    };
  }

  return data;
}
