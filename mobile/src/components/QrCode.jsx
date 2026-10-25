import QRCode from "qrcode";
import { useMemo } from "react";
import Svg, { Path, Rect } from "react-native-svg";

/** QR code drawn as one SVG path (pure JS encoding, so it works in Expo Go). */
export function QrCode({ value, size }) {
  const { path, count } = useMemo(() => {
    try {
      const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
      const n = qr.modules.size;
      let d = "";
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.get(x, y)) d += `M${x} ${y}h1v1h-1z`;
      return { path: d, count: n };
    } catch {
      return { path: "", count: 1 };
    }
  }, [value]);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${count} ${count}`}>
      <Rect width={count} height={count} fill="#fff" />
      <Path d={path} fill="#212325" />
    </Svg>
  );
}
