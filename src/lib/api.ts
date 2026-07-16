import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://hackathon-1096467060974.asia-northeast3.run.app';

export async function getStoredUserId(): Promise<string> {
  const storedUser = await SecureStore.getItemAsync('user');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser && parsedUser.id) {
        return String(parsedUser.id);
      }
    } catch (e) {
      console.error('Failed to parse stored user', e);
    }
  }
  return '9007199254740991'; // Fallback if user is not logged in or doesn't have an ID
}

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

// R2 Presigned URL 요청 및 업로드 유틸리티
export async function uploadToR2(uri: string, uploadType: 'IMAGE' | 'VIDEO', mimeType: string, fileSize: number = 0): Promise<string> {
  const userId = await getStoredUserId();
  const headers: Record<string, string> = {};
  if (userId) {
    headers['X-User-Id'] = userId;
  }

  // 1. Presigned URL 요청 (Swagger 스펙 맞춤)
  const data = await fetchApi('/api/uploads/presigned', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      uploadType,
      contentType: mimeType,
      fileSize: fileSize,
    }),
  });

  // 2. 로컬 파일 가져오기 (Blob)
  const fileResponse = await fetch(uri);
  const blob = await fileResponse.blob();

  // 3. R2로 직접 PUT 업로드
  const uploadRes = await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
    },
    body: blob,
  });

  if (!uploadRes.ok) {
    throw new Error('R2 Upload failed');
  }

  return data.objectKey;
}

// POST /api/posts
export interface CreatePostParams {
  videoObjectKey: string;
  thumbnailImageObjectKey: string;
  title: string;
}

export async function createPost(params: CreatePostParams) {
  const userId = await getStoredUserId();

  const headers: Record<string, string> = {};
  if (userId) {
    headers['X-User-Id'] = userId;
  }

  return fetchApi('/api/posts', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
}

// GET /api/posts
export interface PostResponse {
  id: number;
  videoUrl: string;
  thumbnailImageUrl: string;
  title: string;
  likeCount: number;
  saveCount: number;
  blockCount: number;
  uploaderId: number;
  uploaderNickname: string;
  likedByCurrentUser: boolean;
  savedByCurrentUser: boolean;
  createdAt: string;
}

export async function getPosts(): Promise<PostResponse[]> {
  const userId = await getStoredUserId();
  const headers: Record<string, string> = {};
  if (userId) {
    headers['X-User-Id'] = userId;
  }

  return fetchApi('/api/posts', {
    method: 'GET',
    headers,
  });
}

// GET /api/posts/by-user
export async function getPostsByUser(limit: number = 20): Promise<PostResponse[]> {
  const userId = await getStoredUserId();
  const headers: Record<string, string> = {};
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  // The swagger shows it accepts userId query param or X-User-Id header depending on the variant. Let's use both to be safe.
  return fetchApi(`/api/posts/by-user?userId=${userId}&limit=${limit}`, {
    method: 'GET',
    headers,
  });
}

// POST /api/posts/{postId}/likes
export async function togglePostLike(postId: number) {
  const userId = await getStoredUserId();
  const headers: Record<string, string> = {};
  if (userId) headers['X-User-Id'] = userId;

  return fetchApi(`/api/posts/${postId}/likes`, {
    method: 'POST',
    headers,
  });
}

// POST /api/posts/{postId}/saves
export async function togglePostSave(postId: number) {
  const userId = await getStoredUserId();
  const headers: Record<string, string> = {};
  if (userId) headers['X-User-Id'] = userId;

  return fetchApi(`/api/posts/${postId}/saves`, {
    method: 'POST',
    headers,
  });
}

// POST /api/user/update
export async function updateProfile(params: { id: number; nickname: string; profileImageUrl: string }) {
  const userId = await getStoredUserId();
  const headers: Record<string, string> = {};
  if (userId) headers['X-User-Id'] = userId;

  return fetchApi('/api/user/update', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
}

// POST /api/post-progress/start
export async function startPostProgress(postId: number) {
  const userId = await getStoredUserId();
  const headers: Record<string, string> = {};
  if (userId) headers['X-User-Id'] = userId;

  return fetchApi('/api/post-progress/start', {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId: Number(userId), postId }),
  });
}

// POST /api/post-progress/end
export async function endPostProgress(postId: number) {
  const userId = await getStoredUserId();
  const headers: Record<string, string> = {};
  if (userId) headers['X-User-Id'] = userId;

  return fetchApi('/api/post-progress/end', {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId: Number(userId), postId }),
  });
}

export interface ProgressLog {
  id: number;
  userId: number;
  postId: number;
  postTitle: string;
  action: 'STARTED' | 'ENDED';
  occurredAt: string;
}

// GET /api/post-progress/logs
export async function getPostLogs(limit: number = 20): Promise<ProgressLog[]> {
  const userId = await getStoredUserId();
  const headers: Record<string, string> = {};
  if (userId) headers['X-User-Id'] = userId;

  return fetchApi(`/api/post-progress/logs?userId=${userId}&limit=${limit}`, {
    method: 'GET',
    headers,
  });
}

// GET /api/post-progress/in-progress
export async function getInProgressPosts(limit: number = 20): Promise<PostResponse[]> {
  const userId = await getStoredUserId();
  const headers: Record<string, string> = {};
  if (userId) headers['X-User-Id'] = userId;

  return fetchApi(`/api/post-progress/in-progress?userId=${userId}&limit=${limit}`, {
    method: 'GET',
    headers,
  });
}
