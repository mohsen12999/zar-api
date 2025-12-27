import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already exists');

    const password = await bcrypt.hash(dto.password, 10);
    const token = randomUUID();

    const user = this.usersRepo.create({
      email: dto.email,
      password,
      emailVerificationToken: token,
    });

    await this.usersRepo.save(user);
    await this.mailService.sendVerificationEmail(user.email, token);

    return { message: 'Verification email sent' };
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepo.findOne({ where: { emailVerificationToken: token } });
    if (!user) throw new BadRequestException('Invalid token');


    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await this.usersRepo.save(user);

    return { message: 'Email verified successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException();

    if (!user.isEmailVerified)
      throw new ForbiddenException('Email not verified');


    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException();

    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwtService.sign(payload) };
  }
}