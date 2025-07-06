export interface IServerConfig {
  port: number;
  environment: string;
}

export interface IEnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  nodeEnv: string;
}
