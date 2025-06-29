import { IsEmail, IsString, MinLength } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  @MinLength(1)
  jobTitle: string;
}
