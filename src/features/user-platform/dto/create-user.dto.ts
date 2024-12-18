export class CreateUserDto {
  login: string;
  email: string;
  password: string;
  isConfirmed: boolean;
  confirmationCode: string;
  confirmationCodeExpirationDate: string;
  recoveryCode: string;
  recoveryCodeExpirationDate: string;
}
