import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 3306),
      username: this.configService.get<string>('DB_USERNAME', 'root'),
      password: this.configService.get<string>('DB_PASSWORD', ''),
      database: this.configService.get<string>('DB_DATABASE', 'zar_db'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', true),
      logging: this.configService.get<boolean>('DB_LOGGING', false),
    };
  }
}

