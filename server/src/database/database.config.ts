import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfigService } from '@/config/app-config/app-config.service';

export const getDatabaseConfig = (
  appConfigService: AppConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: appConfigService.getDatabaseHost(),
  port: appConfigService.getDatabasePort(),
  username: appConfigService.getDatabaseUsername(),
  password: appConfigService.getDatabasePassword(),
  database: appConfigService.getDatabaseName(),
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  synchronize: appConfigService.isDevelopment(),
  logging: appConfigService.isDevelopment(),
});
