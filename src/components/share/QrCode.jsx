"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

export function QrCode({ value }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(value, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#212325", light: "#ffffff" } })
      .then((s) => !cancelled && setSvg(s))
      .catch(() => !cancelled && setSvg(""));
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!svg) return <div className="aspect-square w-full animate-pulse rounded-lg bg-wash" />;
  return (
    <div
      className="aspect-square w-full [&>svg]:h-full [&>svg]:w-full"
      role="img"
      aria-label={`QR code for ${value}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
