"use client";

/**
 * Uploads a file straight to storage: asks the server for a one-time upload URL,
 * PUTs the file there (with progress), and returns the file's URL to attach.
 */
export async function uploadFile(file, onProgress) {
  const res = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type }),
  });
  const json = await res.json();
  if (!json.success || !json.data) throw new Error(json.error ?? "Couldn't start the upload.");
  const { uploadUrl, url } = json.data;

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: storage answered ${xhr.status}. Try again.`)));
    xhr.onerror = () => reject(new Error("Upload failed before reaching storage. Check your connection."));
    xhr.send(file);
  });
  return url;
}
