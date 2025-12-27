import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';
@Injectable()
export class AwsService {
  private readonly s3Client: S3Client;
  constructor(private readonly config: ConfigService) {
    this.s3Client = new S3Client({});
  }

  async uploadAvatar(file: Express.Multer.File) {
    return this.uploadFile(
      file,
      this.config.get<string>('AWS_BUCKET_AVATARS') || '',
      'avatars',
    );
  }

  async uploadNotesThumbnail(file: Express.Multer.File) {
    return this.uploadFile(
      file,
      this.config.get<string>('AWS_BUCKET_THUMBNAILS') || '',
      'thumbnails',
    );
  }

  async uploadCourseVideo(file: Express.Multer.File) {
    return this.uploadFile(
      file,
      this.config.get<string>('AWS_BUCKET_COURSES') || '',
      'course-videos',
    );
  }

  async uploadNoteFile(file: Express.Multer.File) {
    return this.uploadFile(
      file,
      this.config.get<string>('AWS_BUCKET_NOTES_FILES') || '',
      'notes-files',
    );
  }

  private async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    folder: string,
  ) {
    const key = `${folder}/${Date.now()}-${file.originalname.replace(
      /\s+/g,
      '-',
    )}`;

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
  }
}
