import { IsEmail, IsInt, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto{
    @IsOptional()
    @IsString()
    name?:string;

    @IsOptional()
    @IsEmail()
    email?:string;

    @IsOptional()
    @MinLength(6)
    password?:string;

    @IsOptional()
    @IsInt()
    age?:number;
}