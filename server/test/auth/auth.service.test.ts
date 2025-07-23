import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { LoginDto } from '../../src/auth/dto/login.dto';
import { User } from '../../src/database/entities/user.entity';
import { mockUser } from '../mock-data/user.mock';
import { AUTH } from '../../src/common/constants/auth.constants';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUserCredentials', () => {
    it('should return user if credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = {
        ...mockUser,
        validatePassword: jest.fn().mockResolvedValue(true),
      } as User;

      mockUsersService.findByEmail.mockResolvedValue(user);

      const result = await service.validateUserCredentials(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(user.validatePassword).toHaveBeenCalledWith(password);
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUserCredentials(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const user = {
        ...mockUser,
        validatePassword: jest.fn().mockResolvedValue(false),
      } as User;

      mockUsersService.findByEmail.mockResolvedValue(user);

      const result = await service.validateUserCredentials(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(user.validatePassword).toHaveBeenCalledWith(password);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const user = {
        ...mockUser,
        validatePassword: jest.fn().mockResolvedValue(true),
        isActive: true,
      } as User;
      const mockToken = 'mock-jwt-token';

      mockUsersService.findByEmail.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(user.validatePassword).toHaveBeenCalledWith(loginDto.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        username: user.username,
        role: user.role?.name || 'USER',
      });
      expect(result).toEqual({
        accessToken: mockToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role?.name || 'USER',
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        AUTH.MESSAGES.INVALID_CREDENTIALS,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException for inactive account', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const user = {
        ...mockUser,
        validatePassword: jest.fn().mockResolvedValue(true),
        isActive: false,
      } as User;

      mockUsersService.findByEmail.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        AUTH.MESSAGES.ACCOUNT_INACTIVE,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const user = {
        ...mockUser,
        validatePassword: jest.fn().mockResolvedValue(false),
        isActive: true,
      } as User;

      mockUsersService.findByEmail.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        AUTH.MESSAGES.INVALID_CREDENTIALS,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(user.validatePassword).toHaveBeenCalledWith(loginDto.password);
    });
  });
});
