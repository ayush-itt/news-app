import { ApiProperty } from '@nestjs/swagger';
import { UserPreference } from '@/database/entities/user-preference.entity';

export class UserPreferenceResponseDto {
  @ApiProperty({ description: 'Preference ID' })
  id: number;

  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'Category ID' })
  categoryId: number;

  @ApiProperty({ description: 'Whether user is subscribed to this category' })
  isSubscribed: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Category details',
    type: 'object',
    properties: {
      id: { type: 'number', description: 'Category ID' },
      name: { type: 'string', description: 'Category name' },
      slug: { type: 'string', description: 'Category slug' },
      description: { type: 'string', description: 'Category description' },
      isActive: { type: 'boolean', description: 'Whether category is active' },
    },
  })
  category?: {
    id: number;
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
  };

  static fromEntity(preference: UserPreference): UserPreferenceResponseDto {
    const response = new UserPreferenceResponseDto();
    response.id = preference.id;
    response.userId = preference.userId;
    response.categoryId = preference.categoryId;
    response.isSubscribed = preference.isSubscribed;
    response.createdAt = preference.createdAt;
    response.updatedAt = preference.updatedAt;

    if (preference.category) {
      response.category = {
        id: preference.category.id,
        name: preference.category.name,
        slug: preference.category.slug,
        description: preference.category.description,
        isActive: preference.category.isActive,
      };
    }

    return response;
  }

  static fromEntities(
    preferences: UserPreference[],
  ): UserPreferenceResponseDto[] {
    return preferences.map((preference) => this.fromEntity(preference));
  }
}
