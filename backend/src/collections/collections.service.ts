import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProductCollection } from './collection.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

export type CollectionUploadFile = {
  buffer?: Buffer;
  mimetype?: string;
  originalname?: string;
  size?: number;
};

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(ProductCollection)
    private readonly repo: Repository<ProductCollection>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  findAll(): Promise<ProductCollection[]> {
    return this.repo.find({ order: { updatedAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ProductCollection> {
    const collection = await this.repo.findOne({ where: { id } });

    if (!collection) {
      throw new NotFoundException(`Collection ${id} not found`);
    }

    return collection;
  }

  create(dto: CreateCollectionDto): Promise<ProductCollection> {
    const collection = this.repo.create({
      ...dto,
      coverImage: dto.coverImage ?? '',
    });
    return this.repo.save(collection);
  }

  async update(
    id: string,
    dto: UpdateCollectionDto,
  ): Promise<ProductCollection> {
    const collection = await this.findOne(id);
    Object.assign(collection, dto);
    return this.repo.save(collection);
  }

  async uploadCoverImage(file: CollectionUploadFile | undefined) {
    if (!file?.buffer) {
      throw new BadRequestException('Collection cover image file is required');
    }

    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Only image uploads are allowed');
    }

    const upload = await this.cloudinary.uploadCollectionCoverImage({
      buffer: file.buffer,
      originalname: file.originalname ?? 'collection-cover',
    });

    return {
      coverImage: upload.secureUrl,
    };
  }

  async remove(id: string): Promise<void> {
    const collection = await this.findOne(id);
    await this.repo.remove(collection);
  }
}
