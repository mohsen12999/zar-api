import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists',
      };
    }

    const user = await this.userService.create(
      registerDto.email,
      registerDto.password,
    );

    return {
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  @Get('verify-email')
  async verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
    const result = await this.userService.verifyEmail(verifyEmailDto.token);
    return result;
  }
}

