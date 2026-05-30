"use client";

import dynamic from "next/dynamic";

const QRScanner = dynamic(
  () => import("@/features/admin/qr-scanner").then((m) => m.QRScanner),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground">Loading scanner...</div>
    ),
  }
);

export default function ScanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">QR Attendance Scanner</h1>
        <p className="text-muted-foreground text-sm">
          Scan attendee QR codes to mark attendance in real-time
        </p>
      </div>
      <QRScanner />
    </div>
  );
}
