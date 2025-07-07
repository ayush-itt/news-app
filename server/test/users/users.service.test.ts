import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../../src/users/users.service';
import { UserRepository } from '../../src/database/repositories';
import { UserPreferencesService } from '../../src/user-preferences/user-preferences.service';
import { RegisterDto } from '../../src/users/dto/register.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';
import { User } from '../../src/database/entities/user.entity';
import { mockUser, mockUsers } from '../mock-data/user.mock';
import { mockRegisterDto, mockUpdateUserDto } from '../mock-data/dto.mock';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;
  let userPreferencesService: UserPreferencesService;

  const mockUserRepository = {
    create: jest.fn(),
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    checkIfExists: jest.fn(),
    findAll: jest.fn(),
    findWithPagination: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  const mockUserPreferencesService = {
    initializeDefaultPreferences: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: UserPreferencesService,
          useValue: mockUserPreferencesService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
    userPreferencesService = module.get<UserPreferencesService>(
      UserPreferencesService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const registerDto: RegisterDto = mockRegisterDto;
      const expectedUser = mockUser as User;

      mockUserRepository.create.mockResolvedValue(expectedUser);

      const result = await service.createUser(registerDto);

      expect(userRepository.create).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const username = 'testuser';
      const expectedUser = mockUser as User;

      mockUserRepository.findByUsername.mockResolvedValue(expectedUser);

      const result = await service.findByUsername(username);

      expect(userRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user not found', async () => {
      const username = 'nonexistent';

      mockUserRepository.findByUsername.mockResolvedValue(null);

      const result = await service.findByUsername(username);

      expect(userRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@example.com';
      const expectedUser = mockUser as User;

      mockUserRepository.findByEmail.mockResolvedValue(expectedUser);

      const result = await service.findByEmail(email);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const userId = 1;
      const expectedUser = mockUser as User;

      mockUserRepository.findById.mockResolvedValue(expectedUser);

      const result = await service.findById(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 999;

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.findById(userId)).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('checkIfUserExists', () => {
    it('should return true if user exists', async () => {
      const username = 'testuser';
      const email = 'test@example.com';

      mockUserRepository.checkIfExists.mockResolvedValue(true);

      const result = await service.checkIfUserExists(username, email);

      expect(userRepository.checkIfExists).toHaveBeenCalledWith(
        username,
        email,
      );
      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      const username = 'newuser';
      const email = 'new@example.com';

      mockUserRepository.checkIfExists.mockResolvedValue(false);

      const result = await service.checkIfUserExists(username, email);

      expect(userRepository.checkIfExists).toHaveBeenCalledWith(
        username,
        email,
      );
      expect(result).toBe(false);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const expectedUsers = mockUsers as User[];

      mockUserRepository.findAll.mockResolvedValue(expectedUsers);

      const result = await service.getAllUsers();

      expect(userRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('getUsersWithPagination', () => {
    it('should return paginated users', async () => {
      const page = 1;
      const limit = 10;
      const expectedResult = { users: mockUsers as User[], total: 3 };

      mockUserRepository.findWithPagination.mockResolvedValue(expectedResult);

      const result = await service.getUsersWithPagination(page, limit);

      expect(userRepository.findWithPagination).toHaveBeenCalledWith(
        page,
        limit,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should use default pagination values', async () => {
      const expectedResult = { users: mockUsers as User[], total: 3 };

      mockUserRepository.findWithPagination.mockResolvedValue(expectedResult);

      const result = await service.getUsersWithPagination();

      expect(userRepository.findWithPagination).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 1;
      const updateData = { username: 'updated' };
      const expectedUser = { ...mockUser, ...updateData } as User;

      mockUserRepository.updateById.mockResolvedValue(expectedUser);

      const result = await service.updateUser(userId, updateData);

      expect(userRepository.updateById).toHaveBeenCalledWith(
        userId,
        updateData,
      );
      expect(result).toEqual(expectedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 1;

      mockUserRepository.deleteById.mockResolvedValue(true);

      const result = await service.deleteUser(userId);

      expect(userRepository.deleteById).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = mockRegisterDto;
      const newUser = mockUser as User;

      mockUserRepository.checkIfExists.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue(newUser);
      mockUserPreferencesService.initializeDefaultPreferences.mockResolvedValue(
        undefined,
      );

      const result = await service.register(registerDto);

      expect(userRepository.checkIfExists).toHaveBeenCalledWith(
        registerDto.username,
        registerDto.email,
      );
      expect(userRepository.create).toHaveBeenCalledWith(registerDto);
      expect(
        userPreferencesService.initializeDefaultPreferences,
      ).toHaveBeenCalledWith(newUser.id);
      expect(result.message).toBe('User registered successfully');
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto: RegisterDto = mockRegisterDto;

      mockUserRepository.checkIfExists.mockResolvedValue(true);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.checkIfExists).toHaveBeenCalledWith(
        registerDto.username,
        registerDto.email,
      );
    });

    it('should throw BadRequestException if user creation fails', async () => {
      const registerDto: RegisterDto = mockRegisterDto;

      mockUserRepository.checkIfExists.mockResolvedValue(false);
      mockUserRepository.create.mockRejectedValue(new Error('Creation failed'));

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userRepository.checkIfExists).toHaveBeenCalledWith(
        registerDto.username,
        registerDto.email,
      );
      expect(userRepository.create).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('updateUserById', () => {
    it('should update user successfully', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = mockUpdateUserDto;
      const existingUser = mockUser as User;
      const updatedUser = { ...existingUser, ...updateUserDto } as User;

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.updateById.mockResolvedValue(updatedUser);

      const result = await service.updateUserById(userId, updateUserDto);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.updateById).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
      expect(result.message).toBe('User updated successfully');
      expect(result.user).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 999;
      const updateUserDto: UpdateUserDto = mockUpdateUserDto;

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateUserById(userId, updateUserDto),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw ConflictException if username already exists', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = { username: 'existinguser' };
      const existingUser = mockUser as User;
      const conflictingUser = {
        ...mockUser,
        id: 2,
        username: 'existinguser',
      } as User;

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByUsername.mockResolvedValue(conflictingUser);

      await expect(
        service.updateUserById(userId, updateUserDto),
      ).rejects.toThrow(ConflictException);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        updateUserDto.username,
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = { email: 'existing@example.com' };
      const existingUser = mockUser as User;
      const conflictingUser = {
        ...mockUser,
        id: 2,
        email: 'existing@example.com',
      } as User;

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByEmail.mockResolvedValue(conflictingUser);

      await expect(
        service.updateUserById(userId, updateUserDto),
      ).rejects.toThrow(ConflictException);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        updateUserDto.email,
      );
    });
  });

  describe('deleteUserById', () => {
    it('should delete user successfully', async () => {
      const userId = 1;
      const existingUser = mockUser as User;

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.deleteById.mockResolvedValue(true);

      const result = await service.deleteUserById(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.deleteById).toHaveBeenCalledWith(userId);
      expect(result.message).toBe('User deleted successfully');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 999;

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.deleteUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw BadRequestException if deletion fails', async () => {
      const userId = 1;
      const existingUser = mockUser as User;

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.deleteById.mockResolvedValue(false);

      await expect(service.deleteUserById(userId)).rejects.toThrow(
        BadRequestException,
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.deleteById).toHaveBeenCalledWith(userId);
    });
  });
});
