// ZATCA / Electronic Invoice TLV Encoder & QR Generator for e_prescriptions
import QRCode from 'qrcode';

export interface ZatcaQrFields {
  sellerName: string;
  vatNumber: string;
  timestamp: string; // ISO 8601
  totalAmount: number;
  vatAmount: number;
}

/**
 * Encodes a string field into TLV (Tag-Length-Value) byte array
 * Tag: 1 byte
 * Length: 1 byte (length of UTF-8 encoded value)
 * Value: UTF-8 encoded bytes
 */
export function encodeTlvField(tagNumber: number, valueStr: string): Uint8Array {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(valueStr);
  const tlvBytes = new Uint8Array(2 + valueBytes.length);
  
  tlvBytes[0] = tagNumber;
  tlvBytes[1] = valueBytes.length;
  tlvBytes.set(valueBytes, 2);
  
  return tlvBytes;
}

/**
 * Encodes the 5 ZATCA standard fields into Base64 TLV payload
 */
export function generateZatcaTlvBase64(fields: ZatcaQrFields): string {
  const tlv1 = encodeTlvField(1, fields.sellerName);
  const tlv2 = encodeTlvField(2, fields.vatNumber);
  const tlv3 = encodeTlvField(3, fields.timestamp);
  const tlv4 = encodeTlvField(4, fields.totalAmount.toFixed(2));
  const tlv5 = encodeTlvField(5, fields.vatAmount.toFixed(2));

  const totalLength = tlv1.length + tlv2.length + tlv3.length + tlv4.length + tlv5.length;
  const combined = new Uint8Array(totalLength);

  let offset = 0;
  for (const part of [tlv1, tlv2, tlv3, tlv4, tlv5]) {
    combined.set(part, offset);
    offset += part.length;
  }

  // Convert Uint8Array to binary string, then base64
  let binary = '';
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

/**
 * Generates QR Code Data URL (PNG) from Base64 TLV
 */
export async function generateQrDataUrl(base64Payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(base64Payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}
