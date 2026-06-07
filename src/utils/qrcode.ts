import QRCode from 'qrcode';
import { env } from '../config/env';

export const generateQrCode = async (ticketId: string): Promise<string> => {
  const url = `${env.APP_URL}/api/v1/tickets/${ticketId}/verify`;
  return QRCode.toDataURL(url);
};
