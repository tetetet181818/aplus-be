import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CoursesGateway } from './courses.gateway';
import { CourseSchema } from '../schemas/courses.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [
    JwtModule,
    AwsModule,
    MongooseModule.forFeature([{ name: 'Course', schema: CourseSchema }]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesGateway],
  exports: [CoursesService],
})
export class CoursesModule {}
