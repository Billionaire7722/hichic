import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProductImage } from './product-image.entity';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { UploadProductImageDto } from './dto/upload-product-image.dto';

export type ProductUploadFile = {
  buffer?: Buffer;
  mimetype?: string;
  originalname?: string;
  size?: number;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imagesRepo: Repository<ProductImage>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  findAll(): Promise<Product[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  findAllForAdmin(): Promise<Product[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  create(dto: CreateProductDto): Promise<Product> {
    const product = this.repo.create(dto);
    return this.repo.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.repo.save(product);
  }

  findImages(productId: string): Promise<ProductImage[]> {
    return this.imagesRepo.find({
      where: { productId },
      order: { usage: 'ASC', position: 'ASC', createdAt: 'ASC' },
    });
  }

  findTryOnImages(): Promise<ProductImage[]> {
    return this.imagesRepo.find({
      where: { usage: 'try_on' },
      relations: { product: true },
      order: { productId: 'ASC', tryOnSize: 'ASC', position: 'ASC' },
    });
  }

  async uploadImage(
    id: string,
    file: ProductUploadFile | undefined,
    dto: UploadProductImageDto,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('Product image file is required');
    }

    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Only image uploads are allowed');
    }

    const product = await this.findOne(id);
    const upload = await this.cloudinary.uploadProductImage(
      {
        buffer: file.buffer,
        originalname: file.originalname ?? 'product-image',
      },
      product.id,
    );
    const usage = dto.usage ?? 'gallery';
    const position = await this.imagesRepo.count({
      where: { productId: id, usage },
    });
    const isGallery =
      usage === 'gallery' &&
      (dto.isGallery === undefined || this.parseBoolean(dto.isGallery));
    const shouldBePrimary =
      usage === 'gallery' &&
      (this.parseBoolean(dto.isPrimary) || position === 0 || !product.image);

    if (shouldBePrimary) {
      await this.imagesRepo.update({ productId: id }, { isPrimary: false });
      product.image = upload.secureUrl;
      product.imagePublicId = upload.publicId;
      await this.repo.save(product);
    }

    const image = this.imagesRepo.create({
      productId: id,
      url: upload.secureUrl,
      publicId: upload.publicId,
      altText: dto.altText?.trim() || product.name,
      position,
      isPrimary: shouldBePrimary,
      isGallery,
      usage,
      tryOnSize: dto.tryOnSize?.trim() || null,
      width: upload.width,
      height: upload.height,
      bytes: upload.bytes,
      format: upload.format,
    });
    const savedImage = await this.imagesRepo.save(image);

    return {
      image: savedImage,
      product: {
        ...product,
        image: shouldBePrimary ? upload.secureUrl : product.image,
        imagePublicId: shouldBePrimary
          ? upload.publicId
          : product.imagePublicId,
      },
    };
  }

  async updateImage(
    productId: string,
    imageId: string,
    dto: UpdateProductImageDto,
  ) {
    const product = await this.findOne(productId);
    const image = await this.imagesRepo.findOne({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException(`Product image ${imageId} not found`);
    }

    if (dto.altText !== undefined) {
      image.altText = dto.altText.trim() || product.name;
    }

    if (dto.position !== undefined) {
      image.position = dto.position;
    }

    if (dto.usage !== undefined) {
      image.usage = dto.usage;
    }

    if (dto.tryOnSize !== undefined) {
      image.tryOnSize = dto.tryOnSize.trim() || null;
    }

    if (dto.isGallery !== undefined) {
      image.isGallery = dto.isGallery;
    }

    if (dto.isPrimary !== undefined) {
      image.isPrimary = dto.isPrimary;

      if (dto.isPrimary) {
        await this.imagesRepo.update(
          { productId, usage: 'gallery' },
          { isPrimary: false },
        );
        image.isGallery = true;
        image.usage = 'gallery';
        product.image = image.url;
        product.imagePublicId = image.publicId;
        await this.repo.save(product);
      }
    }

    const savedImage = await this.imagesRepo.save(image);

    return {
      image: savedImage,
      product,
    };
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.repo.remove(product);
  }

  private parseBoolean(value: boolean | string | undefined): boolean {
    return (
      value === true ||
      value === 'true' ||
      value === '1' ||
      value === 'yes'
    );
  }
}
