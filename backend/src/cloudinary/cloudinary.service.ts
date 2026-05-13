import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

type UploadImageInput = {
  buffer: Buffer;
  originalname: string;
};

export type UploadedCloudinaryImage = {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
};

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  async uploadProductImage(
    file: UploadImageInput,
    productId: string,
  ): Promise<UploadedCloudinaryImage> {
    this.assertConfigured();

    const folder = this.config.get<string>(
      'CLOUDINARY_PRODUCT_FOLDER',
      this.config.get<string>('CLOUDINARY_FOLDER', 'hichic/products'),
    );
    const publicId = `${productId}/${Date.now()}-${this.toSafeFilename(
      file.originalname,
    )}`;

    const result = await this.uploadBuffer(file.buffer, {
      folder,
      public_id: publicId,
      resource_type: 'image',
      overwrite: false,
    });

    return {
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    };
  }

  async uploadCollectionCoverImage(
    file: UploadImageInput,
  ): Promise<UploadedCloudinaryImage> {
    this.assertConfigured();

    const folder = this.config.get<string>(
      'CLOUDINARY_COLLECTION_FOLDER',
      this.config.get<string>('CLOUDINARY_FOLDER', 'hichic/collections'),
    );
    const publicId = `covers/${Date.now()}-${this.toSafeFilename(
      file.originalname,
      'collection-cover',
    )}`;

    const result = await this.uploadBuffer(file.buffer, {
      folder,
      public_id: publicId,
      resource_type: 'image',
      overwrite: false,
    });

    return {
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    };
  }

  async deleteImage(publicId: string): Promise<void> {
    this.assertConfigured();

    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (error) {
      this.logger.warn(
        `Cloudinary cleanup failed for ${publicId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private uploadBuffer(
    buffer: Buffer,
    options: Record<string, string | boolean>,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error || !result) {
            const errorMessage =
              error && typeof error === 'object' && 'message' in error
                ? String((error as { message: unknown }).message)
                : 'Cloudinary upload returned no result';

            reject(error instanceof Error ? error : new Error(errorMessage));
            return;
          }

          resolve(result);
        },
      );

      stream.end(buffer);
    });
  }

  private assertConfigured() {
    const missing = [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ].filter((key) => !this.config.get<string>(key));

    if (missing.length > 0) {
      throw new InternalServerErrorException(
        `Cloudinary is not configured. Missing: ${missing.join(', ')}`,
      );
    }
  }

  private toSafeFilename(filename: string, fallback = 'product-image') {
    const withoutExtension = filename.replace(/\.[^.]+$/, '');

    return (
      withoutExtension
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || fallback
    );
  }
}
