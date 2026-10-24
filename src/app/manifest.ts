import type { MetadataRoute } from "next";

/** Lets "Add to Home Screen" install the owner app full-screen, opening straight to the share screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tapfolio",
    short_name: "Tapfolio",
    description: "Share your contact card with a tap, then follow up with every recruiter.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0A0A0A",
    theme_color: "#0A0A0A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
