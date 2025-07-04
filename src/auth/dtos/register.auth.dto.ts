import { IsEmail, IsInt, IsString, Min, MinLength } from "class-validator";

export class RegisterAuthDto{
    
    @IsEmail()
    email:string;

    @IsString()
    @MinLength(6)
    password:string

    @IsString()
    name:string;

@IsInt()
@Min(0)
age: number;
}