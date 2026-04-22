import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScanResult: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanResult, onScanFailure }) => {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let html5QrcodeScanner: Html5QrcodeScanner | null = null;
    if (scannerRef.current) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        false
      );
      
      html5QrcodeScanner.render(
        (decodedText) => {
          onScanResult(decodedText);
        },
        (errorMessage) => {
          if (onScanFailure) {
            onScanFailure(errorMessage);
          }
        }
      );
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [onScanResult, onScanFailure]);

  return <div id="qr-reader" ref={scannerRef} className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-sm" />;
};

export default QRScanner;
