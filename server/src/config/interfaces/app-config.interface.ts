export interface IAppConfig {
  server: IServerConfig;
  database: IDatabaseConfig;
  jwt: IJwtConfig;
  mail: IMailConfig;
}

export interface IConfigService {
  getServerConfig(): IServerConfig;
  getDatabaseConfig(): IDatabaseConfig;
  getJwtConfig(): IJwtConfig;
  getMailConfig(): IMailConfig;
}

import { IServerConfig } from './server-config.interface';
import { IDatabaseConfig } from './database-config.interface';
import { IJwtConfig } from './jwt-config.interface';
import { IMailConfig } from './mail-config.interface';
