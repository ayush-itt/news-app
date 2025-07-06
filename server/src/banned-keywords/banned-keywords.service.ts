import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { BannedKeywordRepository } from '@/database/repositories/banned-keyword.repository';
import { BannedKeyword } from '@/database/entities/banned-keyword.entity';
import {
  CreateBannedKeywordDto,
  UpdateBannedKeywordDto,
  GetBannedKeywordsQueryDto,
  BannedKeywordListResponseDto,
} from './dto';

@Injectable()
export class BannedKeywordsService {
  private readonly logger = new Logger(BannedKeywordsService.name);

  constructor(
    private readonly bannedKeywordRepository: BannedKeywordRepository,
  ) {}

  /**
   * Create a new banned keyword
   */
  async createBannedKeyword(
    createDto: CreateBannedKeywordDto,
  ): Promise<BannedKeyword> {
    // Check if keyword already exists
    const existingKeyword = await this.bannedKeywordRepository.findByKeyword(
      createDto.keyword,
    );
    if (existingKeyword) {
      throw new ConflictException(
        `Keyword "${createDto.keyword}" is already banned`,
      );
    }

    // Validate regex if isRegex is true
    if (createDto.isRegex) {
      try {
        new RegExp(createDto.keyword);
      } catch (error) {
        throw new BadRequestException('Invalid regular expression syntax');
      }
    }

    const bannedKeyword = await this.bannedKeywordRepository.create({
      keyword: createDto.keyword,
      description: createDto.description,
      isCaseSensitive: createDto.isCaseSensitive ?? false,
      isRegex: createDto.isRegex ?? false,
      isActive: true,
    });

    this.logger.log(
      `Created banned keyword: ${bannedKeyword.keyword} (ID: ${bannedKeyword.id})`,
    );
    return bannedKeyword;
  }

  /**
   * Get all banned keywords with filtering and pagination
   */
  async getBannedKeywords(
    queryDto: GetBannedKeywordsQueryDto,
  ): Promise<BannedKeywordListResponseDto> {
    let keywords = await this.bannedKeywordRepository.findAll();

    // Apply filters
    if (queryDto.isActive !== undefined) {
      keywords = keywords.filter(
        (keyword) => keyword.isActive === queryDto.isActive,
      );
    }

    if (queryDto.search) {
      const searchTerm = queryDto.search.toLowerCase();
      keywords = keywords.filter(
        (keyword) =>
          keyword.keyword.toLowerCase().includes(searchTerm) ||
          (keyword.description &&
            keyword.description.toLowerCase().includes(searchTerm)),
      );
    }

    const total = keywords.length;
    const totalPages = Math.ceil(total / queryDto.limit);

    // Apply pagination
    const startIndex = (queryDto.page - 1) * queryDto.limit;
    const paginatedKeywords = keywords.slice(
      startIndex,
      startIndex + queryDto.limit,
    );

    return {
      keywords: paginatedKeywords,
      total,
      page: queryDto.page,
      limit: queryDto.limit,
      totalPages,
    };
  }

  /**
   * Get banned keyword by ID
   */
  async getBannedKeywordById(id: number): Promise<BannedKeyword> {
    const bannedKeyword = await this.bannedKeywordRepository.findById(id);
    if (!bannedKeyword) {
      throw new NotFoundException(`Banned keyword with ID ${id} not found`);
    }
    return bannedKeyword;
  }

  /**
   * Update a banned keyword
   */
  async updateBannedKeyword(
    id: number,
    updateDto: UpdateBannedKeywordDto,
  ): Promise<BannedKeyword> {
    const existingKeyword = await this.getBannedKeywordById(id);

    // Check if new keyword conflicts with existing ones
    if (updateDto.keyword && updateDto.keyword !== existingKeyword.keyword) {
      const conflictingKeyword =
        await this.bannedKeywordRepository.findByKeyword(updateDto.keyword);
      if (conflictingKeyword) {
        throw new ConflictException(
          `Keyword "${updateDto.keyword}" is already banned`,
        );
      }
    }

    // Validate regex if isRegex is being set to true
    if (updateDto.isRegex || (updateDto.keyword && existingKeyword.isRegex)) {
      const keywordToTest = updateDto.keyword || existingKeyword.keyword;
      try {
        new RegExp(keywordToTest);
      } catch (error) {
        throw new BadRequestException('Invalid regular expression syntax');
      }
    }

    const updatedKeyword = await this.bannedKeywordRepository.update(
      id,
      updateDto,
    );
    if (!updatedKeyword) {
      throw new NotFoundException(`Banned keyword with ID ${id} not found`);
    }

    this.logger.log(
      `Updated banned keyword: ${updatedKeyword.keyword} (ID: ${id})`,
    );
    return updatedKeyword;
  }

  /**
   * Delete a banned keyword
   */
  async deleteBannedKeyword(id: number): Promise<void> {
    const bannedKeyword = await this.getBannedKeywordById(id);
    const deleted = await this.bannedKeywordRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Banned keyword with ID ${id} not found`);
    }

    this.logger.log(
      `Deleted banned keyword: ${bannedKeyword.keyword} (ID: ${id})`,
    );
  }

  /**
   * Toggle active status of a banned keyword
   */
  async toggleBannedKeyword(id: number): Promise<BannedKeyword> {
    const updatedKeyword = await this.bannedKeywordRepository.toggleActive(id);
    if (!updatedKeyword) {
      throw new NotFoundException(`Banned keyword with ID ${id} not found`);
    }

    this.logger.log(
      `Toggled banned keyword: ${updatedKeyword.keyword} (ID: ${id}) - Active: ${updatedKeyword.isActive}`,
    );
    return updatedKeyword;
  }

  /**
   * Get all active banned keywords (for filtering purposes)
   */
  async getActiveBannedKeywords(): Promise<BannedKeyword[]> {
    return this.bannedKeywordRepository.findAllActive();
  }

  /**
   * Check if text contains any banned keywords
   */
  async containsBannedKeywords(
    text: string,
  ): Promise<{ hasBanned: boolean; matchedKeywords: string[] }> {
    const activeBannedKeywords = await this.getActiveBannedKeywords();
    const matchedKeywords: string[] = [];

    for (const bannedKeyword of activeBannedKeywords) {
      let isMatch = false;

      if (bannedKeyword.isRegex) {
        try {
          const regex = new RegExp(
            bannedKeyword.keyword,
            bannedKeyword.isCaseSensitive ? 'g' : 'gi',
          );
          isMatch = regex.test(text);
        } catch (error) {
          this.logger.warn(
            `Invalid regex pattern: ${bannedKeyword.keyword} (ID: ${bannedKeyword.id})`,
          );
          continue;
        }
      } else {
        const searchText = bannedKeyword.isCaseSensitive
          ? text
          : text.toLowerCase();
        const searchKeyword = bannedKeyword.isCaseSensitive
          ? bannedKeyword.keyword
          : bannedKeyword.keyword.toLowerCase();
        isMatch = searchText.includes(searchKeyword);
      }

      if (isMatch) {
        matchedKeywords.push(bannedKeyword.keyword);
      }
    }

    return {
      hasBanned: matchedKeywords.length > 0,
      matchedKeywords,
    };
  }
}
