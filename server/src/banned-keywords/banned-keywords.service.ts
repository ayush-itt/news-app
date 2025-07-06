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

  async create(createDto: CreateBannedKeywordDto): Promise<BannedKeyword> {
    const existingKeyword = await this.bannedKeywordRepository.findByKeyword(
      createDto.keyword,
    );
    if (existingKeyword) {
      throw new ConflictException(
        `Keyword "${createDto.keyword}" is already banned`,
      );
    }

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

  async getList(
    queryDto: GetBannedKeywordsQueryDto,
  ): Promise<BannedKeywordListResponseDto> {
    let keywords = await this.bannedKeywordRepository.findAll();

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

  async getById(id: number): Promise<BannedKeyword> {
    const bannedKeyword = await this.bannedKeywordRepository.findById(id);
    if (!bannedKeyword) {
      throw new NotFoundException(`Banned keyword with ID ${id} not found`);
    }
    return bannedKeyword;
  }

  async update(
    id: number,
    updateDto: UpdateBannedKeywordDto,
  ): Promise<BannedKeyword> {
    const existingKeyword = await this.getById(id);

    if (updateDto.keyword && updateDto.keyword !== existingKeyword.keyword) {
      const conflictingKeyword =
        await this.bannedKeywordRepository.findByKeyword(updateDto.keyword);
      if (conflictingKeyword) {
        throw new ConflictException(
          `Keyword "${updateDto.keyword}" is already banned`,
        );
      }
    }

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

  async delete(id: number): Promise<void> {
    const bannedKeyword = await this.getById(id);
    const deleted = await this.bannedKeywordRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Banned keyword with ID ${id} not found`);
    }

    this.logger.log(
      `Deleted banned keyword: ${bannedKeyword.keyword} (ID: ${id})`,
    );
  }

  async toggle(id: number): Promise<BannedKeyword> {
    const updatedKeyword = await this.bannedKeywordRepository.toggleActive(id);
    if (!updatedKeyword) {
      throw new NotFoundException(`Banned keyword with ID ${id} not found`);
    }

    this.logger.log(
      `Toggled banned keyword: ${updatedKeyword.keyword} (ID: ${id}) - Active: ${updatedKeyword.isActive}`,
    );
    return updatedKeyword;
  }

  async getActiveList(): Promise<BannedKeyword[]> {
    return this.bannedKeywordRepository.findAllActive();
  }

  async validateContent(
    text: string,
  ): Promise<{ hasBanned: boolean; matchedKeywords: string[] }> {
    const activeBannedKeywords = await this.getActiveList();
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
