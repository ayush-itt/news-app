import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReactionTypeEnum } from '../../common/enums/reaction-type.enum';

export class ReactionRequestDto {
  @ApiProperty({
    description: 'Type of reaction to the article',
    enum: ReactionTypeEnum,
    example: ReactionTypeEnum.LIKE,
  })
  @IsEnum(ReactionTypeEnum)
  reaction: ReactionTypeEnum;
}
