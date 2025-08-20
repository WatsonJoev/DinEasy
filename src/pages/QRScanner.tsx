import { useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import clsx from "clsx";

interface QRScannerProps {
  onScan: (tableNumber: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const qrCodeRegionId = "qr-reader";

  useEffect(() => {
    /*
    // Disabled actual scanning logic for now
    const scanner = new Html5Qrcode(qrCodeRegionId);
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 }, disableFlip: true },
        (decodedText) => {
          scanner.stop().catch(() => {});
          onScan(decodedText);
        },
        () => {}
      )
      .catch((err) => {
        console.error("Unable to start QR scanner:", err);
      });

    return () => {
      scanner.stop().catch(() => {});
    };
    */
  }, [onScan]);

  return (
    <div className="relative w-full flex flex-col items-center px-4 py-6">
      {/* Camera icon */}
      <div className="mb-3 bg-blue-100 rounded-full p-2">
        <Camera className="w-5 h-5 text-blue-700" />
      </div>

      {/* Scanner placeholder */}
      <div className="relative w-full max-w-xs aspect-square">
        <div
          id={qrCodeRegionId}
          className={clsx(
            "w-full h-full rounded-xl overflow-hidden bg-black flex items-center justify-center text-white select-none"
          )}
        >
          {/* Placeholder for actual QR scanner output */}
        </div>

        {/* Overlay border */}
        <div className="absolute inset-0 rounded-xl border-[2.5px] border-blue-500 border-dashed pointer-events-none z-10" />
      </div>
    </div>
  );
};

export default QRScanner;
