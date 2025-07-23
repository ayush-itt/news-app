import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { NewsSourcesService } from '../../src/news-sources/news-sources.service';
import { NewsSourceRepository } from '../../src/database/repositories/news-source.repository';
import {
  NewsSource,
  NewsSourceType,
} from '../../src/database/entities/news-source.entity';
import {
  CreateNewsSourceDto,
  UpdateNewsSourceDto,
} from '../../src/news-sources/dto';

describe('NewsSourcesService', () => {
  let service: NewsSourcesService;
  let repository: NewsSourceRepository;

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

  const mockNewsSourceRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findActive: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    findByType: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateLastFetch: jest.fn(),
    existsByName: jest.fn(),
    getSourcesStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsSourcesService,
        {
          provide: NewsSourceRepository,
          useValue: mockNewsSourceRepository,
        },
      ],
    }).compile();

    service = module.get<NewsSourcesService>(NewsSourcesService);
    repository = module.get<NewsSourceRepository>(NewsSourceRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNewsSource', () => {
    it('should create a news source successfully', async () => {
      const createDto: CreateNewsSourceDto = {
        name: 'New News Source',
        type: NewsSourceType.THENEWSAPI,
        baseUrl: 'https://api.example.com',
        apiKeyEnv: 'NEW_API_KEY',
      };

      mockNewsSourceRepository.findByName.mockResolvedValue(null);
      mockNewsSourceRepository.create.mockResolvedValue(mockNewsSource);

      const result = await service.createNewsSource(createDto);

      expect(result).toEqual(mockNewsSource);
      expect(repository.findByName).toHaveBeenCalledWith(createDto.name);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException when name already exists', async () => {
      const createDto: CreateNewsSourceDto = {
        name: 'Existing Source',
        type: NewsSourceType.THENEWSAPI,
        baseUrl: 'https://api.example.com',
        apiKeyEnv: 'API_KEY',
      };

      mockNewsSourceRepository.findByName.mockResolvedValue(mockNewsSource);

      await expect(service.createNewsSource(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findByName).toHaveBeenCalledWith(createDto.name);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when creation fails', async () => {
      const createDto: CreateNewsSourceDto = {
        name: 'New Source',
        type: NewsSourceType.THENEWSAPI,
        baseUrl: 'https://api.example.com',
        apiKeyEnv: 'API_KEY',
      };

      mockNewsSourceRepository.findByName.mockResolvedValue(null);
      mockNewsSourceRepository.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.createNewsSource(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findByName).toHaveBeenCalledWith(createDto.name);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAllNewsSources', () => {
    it('should return all news sources', async () => {
      const mockSources = [mockNewsSource];
      mockNewsSourceRepository.findAll.mockResolvedValue(mockSources);

      const result = await service.findAllNewsSources();

      expect(result).toEqual(mockSources);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no sources exist', async () => {
      mockNewsSourceRepository.findAll.mockResolvedValue([]);

      const result = await service.findAllNewsSources();

      expect(result).toEqual([]);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findActiveNewsSources', () => {
    it('should return only active news sources', async () => {
      const activeSources = [mockNewsSource];
      mockNewsSourceRepository.findActive.mockResolvedValue(activeSources);

      const result = await service.findActiveNewsSources();

      expect(result).toEqual(activeSources);
      expect(repository.findActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('findNewsSourceById', () => {
    it('should return a news source by ID', async () => {
      const sourceId = 1;
      mockNewsSourceRepository.findById.mockResolvedValue(mockNewsSource);

      const result = await service.findNewsSourceById(sourceId);

      expect(result).toEqual(mockNewsSource);
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
    });

    it('should throw NotFoundException when source not found', async () => {
      const sourceId = 999;
      mockNewsSourceRepository.findById.mockResolvedValue(null);

      await expect(service.findNewsSourceById(sourceId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
    });
  });

  describe('findNewsSourcesByType', () => {
    it('should return news sources by type', async () => {
      const sourceType = NewsSourceType.THENEWSAPI;
      const mockSources = [mockNewsSource];
      mockNewsSourceRepository.findByType.mockResolvedValue(mockSources);

      const result = await service.findNewsSourcesByType(sourceType);

      expect(result).toEqual(mockSources);
      expect(repository.findByType).toHaveBeenCalledWith(sourceType);
    });
  });

  describe('updateNewsSource', () => {
    it('should update a news source successfully', async () => {
      const sourceId = 1;
      const updateDto: UpdateNewsSourceDto = {
        name: 'Updated Source',
        apiKeyEnv: 'UPDATED_API_KEY',
      };
      const updatedSource = { ...mockNewsSource, ...updateDto };

      mockNewsSourceRepository.findById.mockResolvedValue(mockNewsSource);
      mockNewsSourceRepository.existsByName.mockResolvedValue(false);
      mockNewsSourceRepository.update.mockResolvedValue(updatedSource);

      const result = await service.updateNewsSource(sourceId, updateDto);

      expect(result).toEqual(updatedSource);
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
      expect(repository.existsByName).toHaveBeenCalledWith(
        updateDto.name,
        sourceId,
      );
      expect(repository.update).toHaveBeenCalledWith(sourceId, updateDto);
    });

    it('should update without name change', async () => {
      const sourceId = 1;
      const updateDto: UpdateNewsSourceDto = {
        apiKeyEnv: 'NEW_API_KEY',
      };
      const updatedSource = { ...mockNewsSource, apiKeyEnv: 'NEW_API_KEY' };

      mockNewsSourceRepository.findById.mockResolvedValue(mockNewsSource);
      mockNewsSourceRepository.update.mockResolvedValue(updatedSource);

      const result = await service.updateNewsSource(sourceId, updateDto);

      expect(result).toEqual(updatedSource);
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
      expect(repository.existsByName).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(sourceId, updateDto);
    });

    it('should throw NotFoundException when source not found', async () => {
      const sourceId = 999;
      const updateDto: UpdateNewsSourceDto = {
        name: 'Updated Source',
      };

      mockNewsSourceRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateNewsSource(sourceId, updateDto),
      ).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
    });

    it('should throw ConflictException when name already exists', async () => {
      const sourceId = 1;
      const updateDto: UpdateNewsSourceDto = {
        name: 'Existing Name',
      };

      mockNewsSourceRepository.findById.mockResolvedValue(mockNewsSource);
      mockNewsSourceRepository.existsByName.mockResolvedValue(true);

      await expect(
        service.updateNewsSource(sourceId, updateDto),
      ).rejects.toThrow(ConflictException);
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
      expect(repository.existsByName).toHaveBeenCalledWith(
        updateDto.name,
        sourceId,
      );
    });

    it('should throw NotFoundException when update fails', async () => {
      const sourceId = 1;
      const updateDto: UpdateNewsSourceDto = {
        name: 'Updated Source',
      };

      mockNewsSourceRepository.findById.mockResolvedValue(mockNewsSource);
      mockNewsSourceRepository.existsByName.mockResolvedValue(false);
      mockNewsSourceRepository.update.mockResolvedValue(null);

      await expect(
        service.updateNewsSource(sourceId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteNewsSource', () => {
    it('should delete a news source successfully', async () => {
      const sourceId = 1;

      mockNewsSourceRepository.findById.mockResolvedValue(mockNewsSource);
      mockNewsSourceRepository.delete.mockResolvedValue(true);

      await service.deleteNewsSource(sourceId);

      expect(repository.findById).toHaveBeenCalledWith(sourceId);
      expect(repository.delete).toHaveBeenCalledWith(sourceId);
    });

    it('should throw NotFoundException when source not found', async () => {
      const sourceId = 999;

      mockNewsSourceRepository.findById.mockResolvedValue(null);

      await expect(service.deleteNewsSource(sourceId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when deletion fails', async () => {
      const sourceId = 1;

      mockNewsSourceRepository.findById.mockResolvedValue(mockNewsSource);
      mockNewsSourceRepository.delete.mockResolvedValue(false);

      await expect(service.deleteNewsSource(sourceId)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
      expect(repository.delete).toHaveBeenCalledWith(sourceId);
    });
  });

  describe('updateLastFetch', () => {
    it('should update last fetch time successfully', async () => {
      const sourceId = 1;

      mockNewsSourceRepository.findById.mockResolvedValue(mockNewsSource);
      mockNewsSourceRepository.updateLastFetch.mockResolvedValue(undefined);

      await service.updateLastFetch(sourceId);

      expect(repository.findById).toHaveBeenCalledWith(sourceId);
      expect(repository.updateLastFetch).toHaveBeenCalledWith(sourceId);
    });

    it('should throw NotFoundException when source not found', async () => {
      const sourceId = 999;

      mockNewsSourceRepository.findById.mockResolvedValue(null);

      await expect(service.updateLastFetch(sourceId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
      expect(repository.updateLastFetch).not.toHaveBeenCalled();
    });
  });

  describe('toggleSourceActive', () => {
    it('should toggle source active status from true to false', async () => {
      const sourceId = 1;
      const inactiveSource = { ...mockNewsSource, isActive: false };

      mockNewsSourceRepository.findById.mockResolvedValue(mockNewsSource);
      mockNewsSourceRepository.update.mockResolvedValue(inactiveSource);

      const result = await service.toggleSourceActive(sourceId);

      expect(result).toEqual(inactiveSource);
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
      expect(repository.update).toHaveBeenCalledWith(sourceId, {
        isActive: false,
      });
    });

    it('should toggle source active status from false to true', async () => {
      const sourceId = 1;
      const inactiveSource = { ...mockNewsSource, isActive: false };
      const activeSource = { ...mockNewsSource, isActive: true };

      mockNewsSourceRepository.findById.mockResolvedValue(inactiveSource);
      mockNewsSourceRepository.update.mockResolvedValue(activeSource);

      const result = await service.toggleSourceActive(sourceId);

      expect(result).toEqual(activeSource);
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
      expect(repository.update).toHaveBeenCalledWith(sourceId, {
        isActive: true,
      });
    });

    it('should throw NotFoundException when source not found', async () => {
      const sourceId = 999;

      mockNewsSourceRepository.findById.mockResolvedValue(null);

      await expect(service.toggleSourceActive(sourceId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when toggle fails', async () => {
      const sourceId = 1;

      mockNewsSourceRepository.findById.mockResolvedValue(mockNewsSource);
      mockNewsSourceRepository.update.mockResolvedValue(null);

      await expect(service.toggleSourceActive(sourceId)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
      expect(repository.update).toHaveBeenCalledWith(sourceId, {
        isActive: false,
      });
    });
  });

  describe('getSourcesStatistics', () => {
    it('should return sources statistics', async () => {
      const mockStats = {
        total: 5,
        active: 3,
        inactive: 2,
        withErrors: 1,
      };

      mockNewsSourceRepository.getSourcesStatistics.mockResolvedValue(
        mockStats,
      );

      const result = await service.getSourcesStatistics();

      expect(result).toEqual(mockStats);
      expect(repository.getSourcesStatistics).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkSourceHealth', () => {
    it('should return healthy status for active source without errors', async () => {
      const healthySource = {
        ...mockNewsSource,
        isActive: true,
        lastError: null,
      };
      mockNewsSourceRepository.findById.mockResolvedValue(healthySource);

      const result = await service.checkSourceHealth(1);

      expect(result).toEqual({
        id: healthySource.id,
        name: healthySource.name,
        lastFetchAt: healthySource.lastFetchAt,
        lastError: healthySource.lastError,
        isHealthy: true,
      });
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should return unhealthy status for inactive source', async () => {
      const unhealthySource = {
        ...mockNewsSource,
        isActive: false,
        lastError: null,
      };
      mockNewsSourceRepository.findById.mockResolvedValue(unhealthySource);

      const result = await service.checkSourceHealth(1);

      expect(result).toEqual({
        id: unhealthySource.id,
        name: unhealthySource.name,
        lastFetchAt: unhealthySource.lastFetchAt,
        lastError: unhealthySource.lastError,
        isHealthy: false,
      });
    });

    it('should return unhealthy status for source with errors', async () => {
      const unhealthySource = {
        ...mockNewsSource,
        isActive: true,
        lastError: 'API Error',
      };
      mockNewsSourceRepository.findById.mockResolvedValue(unhealthySource);

      const result = await service.checkSourceHealth(1);

      expect(result).toEqual({
        id: unhealthySource.id,
        name: unhealthySource.name,
        lastFetchAt: unhealthySource.lastFetchAt,
        lastError: unhealthySource.lastError,
        isHealthy: false,
      });
    });

    it('should throw NotFoundException when source not found', async () => {
      const sourceId = 999;
      mockNewsSourceRepository.findById.mockResolvedValue(null);

      await expect(service.checkSourceHealth(sourceId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(sourceId);
    });
  });
});
