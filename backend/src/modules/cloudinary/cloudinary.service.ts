import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'boatchain',
  ): Promise<{ url: string; public_id: string }> {
    const result = await cloudinary.uploader.upload(
      file.buffer.toString('base64'),
      {
        resource_type: 'image',
        folder,
        format: 'webp',
        quality: 'auto',
        width: 1200,
        height: 800,
        crop: 'limit',
      },
    );

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  async uploadDocument(
    file: Express.Multer.File,
    folder: string = 'boatchain/documents',
  ): Promise<{ url: string; public_id: string }> {
    const result = await cloudinary.uploader.upload(
      file.buffer.toString('base64'),
      {
        resource_type: 'auto',
        folder,
      },
    );

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  async deleteAsset(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
