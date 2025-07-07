import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from '../../src/config/app-config/app-config.service';

describe('AppConfigService', () => {
  let service: AppConfigService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppConfigService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getServerPort', () => {
    it('should return server port as number', () => {
      mockConfigService.get.mockReturnValue('3000');

      const result = service.getServerPort();

      expect(result).toBe(3000);
      expect(configService.get).toHaveBeenCalledWith('SERVER_PORT');
    });

    it('should throw error if SERVER_PORT is missing', () => {
      mockConfigService.get.mockReturnValue(undefined);

      expect(() => service.getServerPort()).toThrow(
        "Configuration key 'SERVER_PORT' is missing",
      );
    });
  });

  describe('getEnvironment', () => {
    it('should return environment value', () => {
      mockConfigService.get.mockReturnValue('production');

      const result = service.getEnvironment();

      expect(result).toBe('production');
      expect(configService.get).toHaveBeenCalledWith('NODE_ENV');
    });

    it('should return default development if NODE_ENV not set', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = service.getEnvironment();

      expect(result).toBe('development');
    });
  });

  describe('Database configuration', () => {
    it('should return database host', () => {
      mockConfigService.get.mockReturnValue('localhost');

      const result = service.getDatabaseHost();

      expect(result).toBe('localhost');
      expect(configService.get).toHaveBeenCalledWith('DATABASE_HOST');
    });

    it('should return database port as number', () => {
      mockConfigService.get.mockReturnValue('5432');

      const result = service.getDatabasePort();

      expect(result).toBe(5432);
      expect(configService.get).toHaveBeenCalledWith('DATABASE_PORT');
    });

    it('should return database username', () => {
      mockConfigService.get.mockReturnValue('testuser');

      const result = service.getDatabaseUsername();

      expect(result).toBe('testuser');
      expect(configService.get).toHaveBeenCalledWith('DATABASE_USERNAME');
    });

    it('should return database password', () => {
      mockConfigService.get.mockReturnValue('testpass');

      const result = service.getDatabasePassword();

      expect(result).toBe('testpass');
      expect(configService.get).toHaveBeenCalledWith('DATABASE_PASSWORD');
    });

    it('should return database name', () => {
      mockConfigService.get.mockReturnValue('testdb');

      const result = service.getDatabaseName();

      expect(result).toBe('testdb');
      expect(configService.get).toHaveBeenCalledWith('DATABASE_NAME');
    });
  });

  describe('Environment utility methods', () => {
    it('should return true for isDevelopment when NODE_ENV is development', () => {
      mockConfigService.get.mockReturnValue('development');

      const result = service.isDevelopment();

      expect(result).toBe(true);
    });

    it('should return false for isDevelopment when NODE_ENV is production', () => {
      mockConfigService.get.mockReturnValue('production');

      const result = service.isDevelopment();

      expect(result).toBe(false);
    });

    it('should return true for isProduction when NODE_ENV is production', () => {
      mockConfigService.get.mockReturnValue('production');

      const result = service.isProduction();

      expect(result).toBe(true);
    });

    it('should return false for isProduction when NODE_ENV is development', () => {
      mockConfigService.get.mockReturnValue('development');

      const result = service.isProduction();

      expect(result).toBe(false);
    });
  });

  describe('JWT configuration', () => {
    it('should return JWT secret', () => {
      mockConfigService.get.mockReturnValue('secret123');

      const result = service.getJwtSecret();

      expect(result).toBe('secret123');
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should return JWT expiration or default', () => {
      mockConfigService.get.mockReturnValue('1d');

      const result = service.getJwtExpiresIn();

      expect(result).toBe('1d');
      expect(configService.get).toHaveBeenCalledWith('JWT_EXPIRES_IN');
    });

    it('should return default JWT expiration if not set', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = service.getJwtExpiresIn();

      expect(result).toBe('7d');
    });
  });

  describe('Mail configuration', () => {
    it('should return mail host', () => {
      mockConfigService.get.mockReturnValue('smtp.gmail.com');

      const result = service.getMailHost();

      expect(result).toBe('smtp.gmail.com');
      expect(configService.get).toHaveBeenCalledWith('MAIL_HOST');
    });

    it('should return mail port as number', () => {
      mockConfigService.get.mockReturnValue('587');

      const result = service.getMailPort();

      expect(result).toBe(587);
      expect(configService.get).toHaveBeenCalledWith('MAIL_PORT');
    });

    it('should return mail secure as boolean', () => {
      mockConfigService.get.mockReturnValue('true');

      const result = service.getMailSecure();

      expect(result).toBe(true);
      expect(configService.get).toHaveBeenCalledWith('MAIL_SECURE');
    });

    it('should return false for mail secure when not set', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = service.getMailSecure();

      expect(result).toBe(false);
    });

    it('should return mail user', () => {
      mockConfigService.get.mockReturnValue('testuser@gmail.com');

      const result = service.getMailUser();

      expect(result).toBe('testuser@gmail.com');
      expect(configService.get).toHaveBeenCalledWith('MAIL_USER');
    });

    it('should return mail password', () => {
      mockConfigService.get.mockReturnValue('mailpass123');

      const result = service.getMailPassword();

      expect(result).toBe('mailpass123');
      expect(configService.get).toHaveBeenCalledWith('MAIL_PASS');
    });

    it('should return mail from name or default', () => {
      mockConfigService.get.mockReturnValue('Custom Name');

      const result = service.getMailFromName();

      expect(result).toBe('Custom Name');
      expect(configService.get).toHaveBeenCalledWith('MAIL_FROM_NAME');
    });

    it('should return default mail from name if not set', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = service.getMailFromName();

      expect(result).toBe('News Aggregator');
    });

    it('should return mail from address', () => {
      mockConfigService.get.mockReturnValue('noreply@example.com');

      const result = service.getMailFromAddress();

      expect(result).toBe('noreply@example.com');
      expect(configService.get).toHaveBeenCalledWith('MAIL_FROM_ADDRESS');
    });
  });

  describe('Grouped configuration methods', () => {
    it('should return server configuration object', () => {
      mockConfigService.get.mockReturnValueOnce('3000');
      mockConfigService.get.mockReturnValueOnce('development');

      const result = service.getServerConfig();

      expect(result).toEqual({
        port: 3000,
        environment: 'development',
      });
    });

    it('should return database configuration object', () => {
      mockConfigService.get.mockReturnValueOnce('localhost');
      mockConfigService.get.mockReturnValueOnce('5432');
      mockConfigService.get.mockReturnValueOnce('testuser');
      mockConfigService.get.mockReturnValueOnce('testpass');
      mockConfigService.get.mockReturnValueOnce('testdb');

      const result = service.getDatabaseConfig();

      expect(result).toEqual({
        host: 'localhost',
        port: 5432,
        username: 'testuser',
        password: 'testpass',
        name: 'testdb',
      });
    });

    it('should return JWT configuration object', () => {
      mockConfigService.get.mockReturnValueOnce('secret123');
      mockConfigService.get.mockReturnValueOnce('1d');

      const result = service.getJwtConfig();

      expect(result).toEqual({
        secret: 'secret123',
        expiresIn: '1d',
      });
    });

    it('should return mail configuration object', () => {
      mockConfigService.get.mockReturnValueOnce('smtp.gmail.com');
      mockConfigService.get.mockReturnValueOnce('587');
      mockConfigService.get.mockReturnValueOnce('true');
      mockConfigService.get.mockReturnValueOnce('testuser@gmail.com');
      mockConfigService.get.mockReturnValueOnce('mailpass123');
      mockConfigService.get.mockReturnValueOnce('Custom Name');
      mockConfigService.get.mockReturnValueOnce('noreply@example.com');

      const result = service.getMailConfig();

      expect(result).toEqual({
        host: 'smtp.gmail.com',
        port: 587,
        secure: true,
        user: 'testuser@gmail.com',
        password: 'mailpass123',
        fromName: 'Custom Name',
        fromAddress: 'noreply@example.com',
      });
    });

    it('should return environment configuration object', () => {
      mockConfigService.get.mockReturnValue('production');

      const result = service.getEnvironmentConfig();

      expect(result).toEqual({
        isDevelopment: false,
        isProduction: true,
        nodeEnv: 'production',
      });
    });
  });

  describe('Legacy methods', () => {
    it('should return port using legacy getPort method', () => {
      mockConfigService.get.mockReturnValue('3000');

      const result = service.getPort();

      expect(result).toBe(3000);
    });

    it('should return node env using legacy getNodeEnv method', () => {
      mockConfigService.get.mockReturnValue('production');

      const result = service.getNodeEnv();

      expect(result).toBe('production');
    });
  });

  describe('Error handling', () => {
    it('should throw error for missing required configuration', () => {
      mockConfigService.get.mockReturnValue(undefined);

      expect(() => service.getDatabaseHost()).toThrow(
        "Configuration key 'DATABASE_HOST' is missing",
      );
    });

    it('should not throw error for optional configuration', () => {
      mockConfigService.get.mockReturnValue(undefined);

      expect(() => service.getJwtExpiresIn()).not.toThrow();
      expect(service.getJwtExpiresIn()).toBe('7d');
    });
  });
});
