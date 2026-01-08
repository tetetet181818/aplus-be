import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
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
      region: config.get<string>('aws.region') || '',
      credentials: {
        accessKeyId: config.get<string>('aws.accessKeyId') || '',
        secretAccessKey: config.get<string>('aws.secretAccessKey') || '',
      },
    });
  }

  async uploadAvatar(
    file: Express.Multer.File,
    onProgress?: (progress: number) => void,
  ) {
    return this.uploadFile(
      file,
      this.config.get<string>('aws.buckets.avatars') || '',
      onProgress,
    );
  }

  async uploadThumbnail(
    file: Express.Multer.File,
    onProgress?: (progress: number) => void,
  ) {
    return this.uploadFile(
      file,
      this.config.get<string>('aws.buckets.thumbnails') || '',
      onProgress,
    );
  }

  async uploadCourseVideo(
    file: Express.Multer.File,
    onProgress?: (progress: number) => void,
  ) {
    return this.uploadFile(
      file,
      this.config.get<string>('aws.buckets.courses') || '',
      onProgress,
    );
  }

  async uploadNoteFile(
    file: Express.Multer.File,
    onProgress?: (progress: number) => void,
  ) {
    return this.uploadFile(
      file,
      this.config.get<string>('aws.buckets.notes') || '',
      onProgress,
    );
  }

  private async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    onProgress?: (progress: number) => void,
  ) {
    const key = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        },
      });

      upload.on('httpUploadProgress', (progress) => {
        if (onProgress && progress.loaded && progress.total) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          onProgress(percent);
        }
      });

      await upload.done();

      return `https://${bucket}.s3.${this.config.get<string>(
        'aws.region',
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
