import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 5, { message: 'Verification code must be exactly 5 digits' })
  code: string;
}

