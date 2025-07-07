import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { LoginDto } from '../../src/auth/dto/login.dto';
import { mockUser } from '../mock-data/user.mock';
import { AUTH } from '../../src/common/constants/auth.constants';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockAuthResult = {
        accessToken: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER',
        },
      };

      mockAuthService.login.mockResolvedValue(mockAuthResult);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        message: AUTH.MESSAGES.LOGIN_SUCCESS,
        accessToken: mockAuthResult.accessToken,
        user: mockAuthResult.user,
      });
    });

    it('should handle login errors', async () => {
      const loginDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };
      const errorMessage = 'Invalid credentials';

      mockAuthService.login.mockRejectedValue(new Error(errorMessage));

      await expect(controller.login(loginDto)).rejects.toThrow(errorMessage);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', () => {
      const result = controller.logout();

      expect(result).toEqual({
        message: AUTH.MESSAGES.LOGOUT_SUCCESS,
      });
    });
  });
});
