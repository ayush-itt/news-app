import { Test, TestingModule } from '@nestjs/testing';
import { UserPreferencesController } from '../../src/user-preferences/user-preferences.controller';
import { UserPreferencesService } from '../../src/user-preferences/user-preferences.service';
import { UpdateUserPreferenceDto } from '../../src/user-preferences/dto';
import { UserPreference } from '../../src/database/entities/user-preference.entity';
import { mockUser } from '../mock-data/user.mock';
import { mockUpdateUserPreferenceDto } from '../mock-data/dto.mock';
import { mockCategory } from '../mock-data/interactions.mock';

describe('UserPreferencesController', () => {
  let controller: UserPreferencesController;
  let service: UserPreferencesService;

  const mockUserPreference: UserPreference = {
    id: 1,
    userId: 1,
    categoryId: 1,
    isSubscribed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser as any,
    category: mockCategory as any,
  };

  const mockUserPreferences: UserPreference[] = [
    mockUserPreference,
    {
      id: 2,
      userId: 1,
      categoryId: 2,
      isSubscribed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: mockUser as any,
      category: { ...mockCategory, id: 2, name: 'Sports' } as any,
    },
  ];

  const mockUserPreferencesService = {
    getUserPreferences: jest.fn(),
    updatePreference: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPreferencesController],
      providers: [
        {
          provide: UserPreferencesService,
          useValue: mockUserPreferencesService,
        },
      ],
    }).compile();

    controller = module.get<UserPreferencesController>(
      UserPreferencesController,
    );
    service = module.get<UserPreferencesService>(UserPreferencesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      const user = mockUser as any;

      mockUserPreferencesService.getUserPreferences.mockResolvedValue(
        mockUserPreferences,
      );

      const result = await controller.getUserPreferences(user);

      expect(service.getUserPreferences).toHaveBeenCalledWith(user.id);
      expect(result).toBeDefined();
    });

    it('should handle errors when fetching preferences', async () => {
      const user = mockUser as any;
      const errorMessage = 'Database error';

      mockUserPreferencesService.getUserPreferences.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.getUserPreferences(user)).rejects.toThrow(
        errorMessage,
      );
      expect(service.getUserPreferences).toHaveBeenCalledWith(user.id);
    });
  });

  describe('updatePreference', () => {
    it('should update user preference successfully', async () => {
      const user = mockUser as any;
      const categoryId = 1;
      const updateDto: UpdateUserPreferenceDto = mockUpdateUserPreferenceDto;
      const updatedPreference = { ...mockUserPreference, isSubscribed: true };

      mockUserPreferencesService.updatePreference.mockResolvedValue(
        updatedPreference,
      );

      const result = await controller.updatePreference(
        user,
        categoryId,
        updateDto,
      );

      expect(service.updatePreference).toHaveBeenCalledWith(
        user.id,
        categoryId,
        updateDto,
      );
      expect(result).toBeDefined();
    });

    it('should handle preference not found', async () => {
      const user = mockUser as any;
      const categoryId = 999;
      const updateDto: UpdateUserPreferenceDto = mockUpdateUserPreferenceDto;
      const errorMessage = 'Preference for category 999 not found';

      mockUserPreferencesService.updatePreference.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        controller.updatePreference(user, categoryId, updateDto),
      ).rejects.toThrow(errorMessage);
      expect(service.updatePreference).toHaveBeenCalledWith(
        user.id,
        categoryId,
        updateDto,
      );
    });

    it('should handle category not found', async () => {
      const user = mockUser as any;
      const categoryId = 999;
      const updateDto: UpdateUserPreferenceDto = mockUpdateUserPreferenceDto;
      const errorMessage = 'Category with ID 999 not found';

      mockUserPreferencesService.updatePreference.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        controller.updatePreference(user, categoryId, updateDto),
      ).rejects.toThrow(errorMessage);
      expect(service.updatePreference).toHaveBeenCalledWith(
        user.id,
        categoryId,
        updateDto,
      );
    });

    it('should handle inactive category', async () => {
      const user = mockUser as any;
      const categoryId = 1;
      const updateDto: UpdateUserPreferenceDto = mockUpdateUserPreferenceDto;
      const errorMessage = 'Category 1 is not available for preferences';

      mockUserPreferencesService.updatePreference.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        controller.updatePreference(user, categoryId, updateDto),
      ).rejects.toThrow(errorMessage);
      expect(service.updatePreference).toHaveBeenCalledWith(
        user.id,
        categoryId,
        updateDto,
      );
    });
  });
});
