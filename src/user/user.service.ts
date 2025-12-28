import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  async create(email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate random 5-digit verification code
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    const codeExpiry = new Date();
    codeExpiry.setHours(codeExpiry.getHours() + 24); // Code expires in 24 hours

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      emailVerificationCode: verificationCode,
      emailVerificationCodeExpiry: codeExpiry,
      isEmailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // Send verification email with code
    await this.emailService.sendVerificationEmail(
      savedUser.email,
      verificationCode,
    );

    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async verifyEmail(code: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationCode: code },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification code');
    }

    if (user.isEmailVerified) {
      return {
        success: false,
        message: 'Email already verified',
      };
    }

    if (user.emailVerificationCodeExpiry < new Date()) {
      return {
        success: false,
        message: 'Verification code has expired',
      };
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationCodeExpiry = null;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }
}

