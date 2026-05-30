import QRCode from "qrcode";

export async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });
}

export function getQRData(attendeeId: string, eventId: string): string {
  return JSON.stringify({
    attendeeId,
    eventId,
    type: "vedam-event-ticket",
    v: 1,
  });
}
