import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductImageDto {
  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isGallery?: boolean;

  @IsOptional()
  @IsIn(['gallery', 'try_on'])
  usage?: 'gallery' | 'try_on';

  @IsOptional()
  @IsString()
  tryOnSize?: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}
