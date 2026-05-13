import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsOptional()
  @IsIn(['Draft', 'Published', 'Hidden'])
  status?: 'Draft' | 'Published' | 'Hidden';

  @IsOptional()
  @IsInt()
  @Min(0)
  productCount?: number;
}
