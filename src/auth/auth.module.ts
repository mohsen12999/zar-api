import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { SignOptions } from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('JWT_SECRET') ?? 'default-secret';
        const raw = config.get<string>('JWT_EXPIRES') ?? '1h';

        // parse numeric string -> number, otherwise keep the timespan string
        let expiresIn: SignOptions['expiresIn'];
        if (/^\d+$/.test(raw)) {
          expiresIn = Number(raw);
        } else {
          // SignOptions may use a branded StringValue type that isn't compatible with plain `string`
          // `as unknown as SignOptions['expiresIn']` is a narrow, explicit cast after basic validation
          expiresIn = raw as unknown as SignOptions['expiresIn'];
        }

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
