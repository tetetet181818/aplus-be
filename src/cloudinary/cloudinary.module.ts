import { Module } from '@nestjs/common';

import { CloudinaryConfig } from './cloudinary.config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  ],
})
export class CloudinaryModule {
  constructor() {
    CloudinaryConfig();
  }
}
