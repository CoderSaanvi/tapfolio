import { File } from "expo-file-system";
import * as SecureStore from "expo-secure-store";

/**
 * Talks to the Tapfolio web backend (tapfolio/src/app/api). Set EXPO_PUBLIC_API_URL
 * in mobile/.env.local: your Mac's address while developing (e.g. http://172.20.10.2:3800
 * on your phone's hotspot), or the deployed site.
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

const TOKEN_KEY = "tapfolio.ownerToken";

export const tokenStore = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

/** Server URLs can be relative (local storage mode); make them absolute. */
export function absolute(url) {
  return /^https?:\/\//.test(url) ? url : `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/** JSON request with the owner token attached. Throws ApiError with the server's message. */
export async function api(path, init = {}) {
  if (!API_URL) throw new ApiError("Set EXPO_PUBLIC_API_URL in mobile/.env.local.", 0);
  const token = await tokenStore.get();
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: init.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(`Can't reach Tapfolio at ${API_URL}. Is the server running and on the same network?`, 0);
  }
  let json;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("The server sent an unexpected response.", res.status);
  }
  if (!json.success || json.data === undefined) throw new ApiError(json.error ?? "Something went wrong.", res.status);
  return json.data;
}

/** Uploads a picked file straight to storage via a one-time URL; returns the URL to attach. */
export async function uploadFile(uri, contentType, onProgress) {
  const ticket = await api("/api/uploads", { method: "POST", body: { contentType } });
  try {
    const task = new File(uri).createUploadTask(absolute(ticket.uploadUrl), {
      httpMethod: "PUT",
      headers: { "Content-Type": contentType },
      // expo-file-system reports these as BigInt; convert before doing float math.
      onProgress: ({ bytesSent, totalBytes }) => {
        const total = Number(totalBytes);
        if (total > 0) onProgress?.(Math.round((Number(bytesSent) / total) * 100));
      },
    });
    const result = await task.uploadAsync();
    if (!result) throw new ApiError("Upload failed before reaching storage. Check your connection and try again.", 0);
    if (result.status < 200 || result.status >= 300) throw new ApiError(`Upload failed: storage answered ${result.status}. Try again.`, result.status);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Upload failed. Check your connection and try again.", 0);
  }
  return ticket.url;
}
