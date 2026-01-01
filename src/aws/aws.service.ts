import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';
@Injectable()
export class AwsService {
  private readonly logger = new Logger(AwsService.name);
  private readonly s3Client: S3Client;
  constructor(private readonly config: ConfigService) {
    this.s3Client = new S3Client({
      region: config.get<string>('AWS_REGION') || '',
      credentials: {
        accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadAvatar(file: Express.Multer.File) {
    return this.uploadFile(
      file,
      this.config.get<string>('AWS_BUCKET_AVATARS') || '',
    );
  }

  async uploadThumbnail(file: Express.Multer.File) {
    return this.uploadFile(
      file,
      this.config.get<string>('AWS_BUCKET_THUMBNAILS') || '',
    );
  }

  async uploadCourseVideo(file: Express.Multer.File) {
    return this.uploadFile(
      file,
      this.config.get<string>('AWS_BUCKET_COURSES') || '',
    );
  }

  async uploadNoteFile(file: Express.Multer.File) {
    return this.uploadFile(
      file,
      this.config.get<string>('AWS_BUCKET_NOTES_FILES') || '',
    );
  }

  private async uploadFile(file: Express.Multer.File, bucket: string) {
    const key = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        }),
      );

      return `https://${bucket}.s3.${this.config.get<string>(
        'AWS_REGION',
      )}.amazonaws.com/${key}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to upload file to S3: ${errorMessage}`,
        errorStack,
      );
      throw new InternalServerErrorException(
        'خطأ في تحميل الملف، يرجى المحاولة لاحقاً ⚠️',
      );
    }
  }
}
