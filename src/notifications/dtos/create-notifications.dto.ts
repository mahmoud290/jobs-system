import { IsInt, IsString, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @IsInt()
  userId: number;

  @IsString()
  @MinLength(1)
  message: string;
}
