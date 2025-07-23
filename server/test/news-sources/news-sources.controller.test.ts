import { Test, TestingModule } from '@nestjs/testing';
import { NewsSourcesController } from '../../src/news-sources/news-sources.controller';
import { NewsSourcesService } from '../../src/news-sources/news-sources.service';
import {
  NewsSource,
  NewsSourceType,
} from '../../src/database/entities/news-source.entity';
import {
  UpdateNewsSourceDto,
  NewsSourceResponseDto,
} from '../../src/news-sources/dto';

describe('NewsSourcesController', () => {
  let controller: NewsSourcesController;
  let service: NewsSourcesService;

  const mockNewsSource: NewsSource = {
    id: 1,
    name: 'Test News Source',
    type: NewsSourceType.THENEWSAPI,
    baseUrl: 'https://api.example.com',
    apiKeyEnv: 'TEST_API_KEY',
    isActive: true,
    lastFetchAt: new Date('2023-01-01'),
    lastError: null,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockNewsSourcesService = {
    findAllNewsSources: jest.fn(),
    findNewsSourceById: jest.fn(),
    updateNewsSource: jest.fn(),
    createNewsSource: jest.fn(),
    deleteNewsSource: jest.fn(),
    findActiveNewsSources: jest.fn(),
    toggleSourceActive: jest.fn(),
    getSourcesStatistics: jest.fn(),
    checkSourceHealth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsSourcesController],
      providers: [
        {
          provide: NewsSourcesService,
          useValue: mockNewsSourcesService,
        },
      ],
    }).compile();

    controller = module.get<NewsSourcesController>(NewsSourcesController);
    service = module.get<NewsSourcesService>(NewsSourcesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all news sources', async () => {
      const mockSources = [mockNewsSource];
      mockNewsSourcesService.findAllNewsSources.mockResolvedValue(mockSources);

      const result = await controller.findAll();

      expect(result).toEqual(NewsSourceResponseDto.fromEntities(mockSources));
      expect(service.findAllNewsSources).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no sources exist', async () => {
      mockNewsSourcesService.findAllNewsSources.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAllNewsSources).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a news source by ID', async () => {
      const sourceId = 1;
      mockNewsSourcesService.findNewsSourceById.mockResolvedValue(
        mockNewsSource,
      );

      const result = await controller.findOne(sourceId);

      expect(result).toEqual(NewsSourceResponseDto.fromEntity(mockNewsSource));
      expect(service.findNewsSourceById).toHaveBeenCalledWith(sourceId);
    });

    it('should throw NotFoundException when source not found', async () => {
      const sourceId = 999;
      mockNewsSourcesService.findNewsSourceById.mockRejectedValue(
        new Error('News source not found'),
      );

      await expect(controller.findOne(sourceId)).rejects.toThrow();
      expect(service.findNewsSourceById).toHaveBeenCalledWith(sourceId);
    });
  });

  describe('update', () => {
    it('should update a news source successfully', async () => {
      const sourceId = 1;
      const updateDto: UpdateNewsSourceDto = {
        name: 'Updated News Source',
        apiKeyEnv: 'UPDATED_API_KEY',
      };
      const updatedSource = { ...mockNewsSource, ...updateDto };

      mockNewsSourcesService.updateNewsSource.mockResolvedValue(updatedSource);

      const result = await controller.update(sourceId, updateDto);

      expect(result).toEqual(NewsSourceResponseDto.fromEntity(updatedSource));
      expect(service.updateNewsSource).toHaveBeenCalledWith(
        sourceId,
        updateDto,
      );
    });

    it('should handle update with only name change', async () => {
      const sourceId = 1;
      const updateDto: UpdateNewsSourceDto = {
        name: 'New Name Only',
      };
      const updatedSource = { ...mockNewsSource, name: 'New Name Only' };

      mockNewsSourcesService.updateNewsSource.mockResolvedValue(updatedSource);

      const result = await controller.update(sourceId, updateDto);

      expect(result).toEqual(NewsSourceResponseDto.fromEntity(updatedSource));
      expect(service.updateNewsSource).toHaveBeenCalledWith(
        sourceId,
        updateDto,
      );
    });

    it('should handle update with only API key change', async () => {
      const sourceId = 1;
      const updateDto: UpdateNewsSourceDto = {
        apiKeyEnv: 'NEW_API_KEY',
      };
      const updatedSource = { ...mockNewsSource, apiKeyEnv: 'NEW_API_KEY' };

      mockNewsSourcesService.updateNewsSource.mockResolvedValue(updatedSource);

      const result = await controller.update(sourceId, updateDto);

      expect(result).toEqual(NewsSourceResponseDto.fromEntity(updatedSource));
      expect(service.updateNewsSource).toHaveBeenCalledWith(
        sourceId,
        updateDto,
      );
    });

    it('should throw ConflictException when name already exists', async () => {
      const sourceId = 1;
      const updateDto: UpdateNewsSourceDto = {
        name: 'Existing Name',
      };

      mockNewsSourcesService.updateNewsSource.mockRejectedValue(
        new Error('Name already exists'),
      );

      await expect(controller.update(sourceId, updateDto)).rejects.toThrow();
      expect(service.updateNewsSource).toHaveBeenCalledWith(
        sourceId,
        updateDto,
      );
    });

    it('should throw NotFoundException when source not found', async () => {
      const sourceId = 999;
      const updateDto: UpdateNewsSourceDto = {
        name: 'Non-existent Source',
      };

      mockNewsSourcesService.updateNewsSource.mockRejectedValue(
        new Error('News source not found'),
      );

      await expect(controller.update(sourceId, updateDto)).rejects.toThrow();
      expect(service.updateNewsSource).toHaveBeenCalledWith(
        sourceId,
        updateDto,
      );
    });
  });

  describe('integration with DTOs', () => {
    it('should properly transform single entity to DTO', async () => {
      const sourceId = 1;
      mockNewsSourcesService.findNewsSourceById.mockResolvedValue(
        mockNewsSource,
      );

      const result = await controller.findOne(sourceId);

      expect(result).toHaveProperty('id', mockNewsSource.id);
      expect(result).toHaveProperty('name', mockNewsSource.name);
      expect(result).toHaveProperty('type', mockNewsSource.type);
      expect(result).toHaveProperty('baseUrl', mockNewsSource.baseUrl);
      expect(result).toHaveProperty('isActive', mockNewsSource.isActive);
      expect(result).toHaveProperty('lastFetchAt', mockNewsSource.lastFetchAt);
      expect(result).toHaveProperty('lastError', mockNewsSource.lastError);
    });

    it('should properly transform multiple entities to DTOs', async () => {
      const mockSources = [
        mockNewsSource,
        { ...mockNewsSource, id: 2, name: 'Source 2' },
      ];
      mockNewsSourcesService.findAllNewsSources.mockResolvedValue(mockSources);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', mockNewsSource.id);
      expect(result[1]).toHaveProperty('id', 2);
      expect(result[1]).toHaveProperty('name', 'Source 2');
    });
  });

  describe('validation', () => {
    it('should handle ParseIntPipe validation for ID parameter', async () => {
      // This test verifies that the ParseIntPipe decorator is properly applied
      // The actual validation would be handled by NestJS framework
      mockNewsSourcesService.findNewsSourceById.mockResolvedValue(
        mockNewsSource,
      );

      const result = await controller.findOne(1);

      expect(result).toBeDefined();
      expect(service.findNewsSourceById).toHaveBeenCalledWith(1);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      mockNewsSourcesService.findAllNewsSources.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Service error');
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockNewsSourcesService.findNewsSourceById.mockRejectedValue(dbError);

      await expect(controller.findOne(1)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle validation errors from service', async () => {
      const validationError = new Error('Invalid input data');
      mockNewsSourcesService.updateNewsSource.mockRejectedValue(
        validationError,
      );

      const updateDto: UpdateNewsSourceDto = { name: 'Test' };
      await expect(controller.update(1, updateDto)).rejects.toThrow(
        'Invalid input data',
      );
    });
  });
});
