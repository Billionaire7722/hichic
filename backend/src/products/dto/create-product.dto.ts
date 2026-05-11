import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  nameVi: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  categoryVi: string;

  @IsString()
  @IsNotEmpty()
  price: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  descriptionVi?: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsOptional()
  @IsIn(['shirt', 'blazer', 'trousers', 'skirt'])
  garment?: string;

  @IsOptional()
  @IsIn(['upper', 'lower'])
  region?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
