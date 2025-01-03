export class CreateDeviceSessionDto {
  userId: string;
  deviceId: string;
  ip: string;
  deviceName: string;
  issuedAt: number;
  expirationDate: number;
}
