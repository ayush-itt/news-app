import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { DatabaseModule } from './database/database.module';
import { getDatabaseConfig } from './database/database.config';
import { AppConfigModule } from './config/app-config/app-config.module';
import { AppConfigService } from './config/app-config/app-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: getDatabaseConfig,
      inject: [AppConfigService],
    }),
    DatabaseModule,
    AppConfigModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
  ],
})
export class AppModule {}
