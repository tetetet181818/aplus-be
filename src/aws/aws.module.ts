import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [AwsService],
  imports: [ConfigModule],
  exports: [AwsService],
})
export class AwsModule {}
