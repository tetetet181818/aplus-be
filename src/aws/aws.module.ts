import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { AwsController } from './aws.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AwsController],
  providers: [AwsService],
  imports: [ConfigModule],
  exports: [AwsService],
})
export class AwsModule {}
