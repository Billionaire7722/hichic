import { IsIn, IsOptional, IsString } from 'class-validator';

export class UploadProductImageDto {
  @IsOptional()
  @IsString()
  altText?: string;

  /** Multipart forms send booleans as strings. */
  @IsOptional()
  @IsString()
  isPrimary?: string;

  @IsOptional()
  @IsString()
  isGallery?: string;

  @IsOptional()
  @IsIn(['gallery', 'try_on'])
  usage?: 'gallery' | 'try_on';

  @IsOptional()
  @IsString()
  tryOnSize?: string;
}
