"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clientApiFetch } from "@/lib/api-client";

interface ScanResult {
  success: boolean;
  message: string;
  name?: string;
  event?: string;
  timestamp: Date;
}

export function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    if (!containerRef.current) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await handleScan(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      console.error("Scanner start failed:", err);
      alert("Could not access camera. Please allow camera permissions.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setScanning(false);
  };

  const handleScan = async (qrData: string) => {
    try {
      const response = await clientApiFetch("/api/attendance/scan", {
        method: "POST",
        body: JSON.stringify({ qrData }),
      });

      const result = await response.json();

      const scanResult: ScanResult = {
        success: result.success,
        message: result.success
          ? `Checked in: ${result.registration?.name}`
          : result.error || "Scan failed",
        name: result.registration?.name,
        event: result.registration?.events?.title,
        timestamp: new Date(),
      };

      setResults((prev) => [scanResult, ...prev].slice(0, 20));
    } catch {
      setResults((prev) => [
        {
          success: false,
          message: "Network error",
          timestamp: new Date(),
        },
        ...prev,
      ].slice(0, 20));
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <div
          id="qr-reader"
          ref={containerRef}
          className="rounded-2xl overflow-hidden bg-black min-h-[300px]"
        />

        <div className="mt-4 flex gap-3">
          {!scanning ? (
            <Button onClick={startScanner} className="flex-1">
              Start Scanner
            </Button>
          ) : (
            <Button onClick={stopScanner} variant="destructive" className="flex-1">
              Stop Scanner
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          Point camera at attendee QR code for check-in
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Scan History</h3>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No scans yet. Start the scanner to begin.
            </p>
          ) : (
            results.map((result, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-4 rounded-xl border ${
                  result.success
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}
              >
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                ) : result.message.includes("Already") ? (
                  <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{result.message}</p>
                  {result.event && (
                    <p className="text-xs text-muted-foreground">{result.event}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Badge variant={result.success ? "success" : "secondary"}>
                  {result.success ? "OK" : "Fail"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
