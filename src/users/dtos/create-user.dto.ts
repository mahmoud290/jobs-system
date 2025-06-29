import { IsEmail, IsInt, IsNotEmpty, IsString, Min, MinLength } from "class-validator";

export class CreateUserDto{
    @IsNotEmpty()
    @IsString()
    name:string;

    @IsEmail()
    email:string;

    @MinLength(6)
    password:string;

    @IsNotEmpty()
    @IsInt()
    @Min(18)
    age:number;
}