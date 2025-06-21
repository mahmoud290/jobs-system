import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
    secret: 'secret123', 
    signOptions: { expiresIn: '1d' },
    }),
],
providers: [AuthService],
controllers: [AuthController],
})
export class AuthModule {}
