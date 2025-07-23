import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { RegisterDto } from '../../src/users/dto/register.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';
import { User } from '../../src/database/entities/user.entity';
import { mockUser, mockAdmin } from '../mock-data/user.mock';
import { mockRegisterDto, mockUpdateUserDto } from '../mock-data/dto.mock';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    register: jest.fn(),
    getAllUsers: jest.fn(),
    findById: jest.fn(),
    updateUserById: jest.fn(),
    deleteUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = mockRegisterDto;
      const expectedResponse = { message: 'User registered successfully' };

      mockUsersService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({ message: expectedResponse.message });
    });

    it('should handle registration errors', async () => {
      const registerDto: RegisterDto = mockRegisterDto;
      const errorMessage = 'Username or email already exists';

      mockUsersService.register.mockRejectedValue(new Error(errorMessage));

      await expect(controller.register(registerDto)).rejects.toThrow(
        errorMessage,
      );
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users for admin', async () => {
      const expectedUsers = [mockUser, mockAdmin];

      mockUsersService.getAllUsers.mockResolvedValue(expectedUsers);

      const result = await controller.getAllUsers();

      expect(service.getAllUsers).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });

    it('should handle errors when fetching all users', async () => {
      const errorMessage = 'Failed to fetch users';

      mockUsersService.getAllUsers.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getAllUsers()).rejects.toThrow(errorMessage);
      expect(service.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return current user profile', () => {
      const user = mockUser as User;

      const result = controller.getProfile(user);

      expect(result).toEqual(user);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID for admin', async () => {
      const userId = 1;
      const expectedUser = mockUser;

      mockUsersService.findById.mockResolvedValue(expectedUser);

      const result = await controller.getUserById(userId);

      expect(service.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });

    it('should handle user not found', async () => {
      const userId = 999;
      const errorMessage = 'User with ID 999 not found';

      mockUsersService.findById.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getUserById(userId)).rejects.toThrow(
        errorMessage,
      );
      expect(service.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const user = mockUser as User;
      const updateUserDto: UpdateUserDto = mockUpdateUserDto;
      const expectedResponse = { message: 'User updated successfully' };

      mockUsersService.updateUserById.mockResolvedValue(expectedResponse);

      const result = await controller.updateProfile(user, updateUserDto);

      expect(service.updateUserById).toHaveBeenCalledWith(
        user.id,
        updateUserDto,
      );
      expect(result).toEqual({ message: expectedResponse.message });
    });

    it('should handle update conflicts', async () => {
      const user = mockUser as User;
      const updateUserDto: UpdateUserDto = mockUpdateUserDto;
      const errorMessage = 'Username or email already exists';

      mockUsersService.updateUserById.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        controller.updateProfile(user, updateUserDto),
      ).rejects.toThrow(errorMessage);
      expect(service.updateUserById).toHaveBeenCalledWith(
        user.id,
        updateUserDto,
      );
    });
  });

  describe('deleteProfile', () => {
    it('should delete user profile successfully', async () => {
      const user = mockUser as User;
      const expectedResponse = { message: 'User deleted successfully' };

      mockUsersService.deleteUserById.mockResolvedValue(expectedResponse);

      const result = await controller.deleteProfile(user);

      expect(service.deleteUserById).toHaveBeenCalledWith(user.id);
      expect(result).toEqual({ message: expectedResponse.message });
    });

    it('should handle deletion errors', async () => {
      const user = mockUser as User;
      const errorMessage = 'Failed to delete user';

      mockUsersService.deleteUserById.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.deleteProfile(user)).rejects.toThrow(
        errorMessage,
      );
      expect(service.deleteUserById).toHaveBeenCalledWith(user.id);
    });
  });
});
