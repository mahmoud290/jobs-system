import { LoginAuthDto } from './dtos/login.auth.dto';
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/user.entity";
import { Repository } from "typeorm";
import { RegisterAuthDto } from "./dtos/register.auth.dto";

@Injectable()
export class AuthService{
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
    private jwtService: JwtService,
    ){}


    async register (registerDto:RegisterAuthDto){
        const {email,password,name,age} = registerDto;

        const existingUser=await this.userRepo.findOne({where:{email}});
    if(existingUser){
        throw new BadRequestException('Email Already in Use');
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const user = this.userRepo.create({
        email,
        password:hashedPassword,
        name,
        age,
    });

    await this.userRepo.save(user);

    return {message:'User registered successfully'};
    }

    async login(loginDto:LoginAuthDto){
        const {email,password}= loginDto;

        const user = await this.userRepo.findOne({where:{email}});
        if(!user){
            throw new UnauthorizedException('Invalid credentials')
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
    }
}