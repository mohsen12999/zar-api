import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your@email.com',
      pass: 'app-password',
    },
  });

  async sendVerificationEmail(email: string, token: string) {
    const link = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      to: email,
      subject: 'Verify your email',
      html: `<p>Please verify your email:</p><a href="${link}">${link}</a>`,
    });
  }
}
