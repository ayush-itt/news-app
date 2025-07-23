import { PartialType } from '@nestjs/swagger';
import { CreateArticleDto } from './create-article.dto';
import { IArticleUpdate } from '../interfaces';

export class UpdateArticleDto
  extends PartialType(CreateArticleDto)
  implements IArticleUpdate {}
