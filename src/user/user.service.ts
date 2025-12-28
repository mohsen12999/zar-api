import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
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
    const verificationToken = uuidv4();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token expires in 24 hours

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiry: tokenExpiry,
      isEmailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // Send verification email
    await this.emailService.sendVerificationEmail(
      savedUser.email,
      verificationToken,
    );

    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    if (user.isEmailVerified) {
      return {
        success: false,
        message: 'Email already verified',
      };
    }

    if (user.emailVerificationTokenExpiry < new Date()) {
      return {
        success: false,
        message: 'Verification token has expired',
      };
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiry = null;
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

