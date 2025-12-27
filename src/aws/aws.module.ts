import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { AwsController } from './aws.controller';
// import { AwsSdkModule } from 'aws-sdk-v3-nest';
// import { S3Client } from '@aws-sdk/client-s3';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AwsController],
  providers: [AwsService],
  imports: [ConfigModule],
  exports: [AwsService],
})
export class AwsModule {}
