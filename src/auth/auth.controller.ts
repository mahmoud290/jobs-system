
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dtos/login.auth.dto';
import { RegisterAuthDto } from './dtos/register.auth.dto';

@Controller('auth')
export class AuthController {
constructor(private readonly authService: AuthService) {}

@Post('register')
register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
}

@Post('login')
login(@Body() loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
}
}
