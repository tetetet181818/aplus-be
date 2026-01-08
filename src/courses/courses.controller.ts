import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';
import { CreateModuleDto } from './dtos/create-module.dto';
import { AddLessonDto } from './dtos/add-lesson.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../utils/types';
import type { Express } from 'express';
import { ValidateObjectIdPipe } from '../pipes/validate-object-id.pipe';

@ApiTags('Courses')
@Controller('/api/v1/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('/create')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new course with a thumbnail' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        thumbnail: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'string' },
        ownerPhone: { type: 'string' },
      },
      required: ['thumbnail', 'title', 'description', 'ownerPhone'],
    },
  })
  public createCourse(
    @Body() body: CreateCourseDto,
    @CurrentUser() payload: JwtPayload,
    @UploadedFile() thumbnail: Express.Multer.File,
  ) {
    if (!thumbnail) {
      throw new BadRequestException('يجب تحميل صورة مصغرة للدورة');
    }
    return this.coursesService.createCourse(body, payload, thumbnail);
  }

  @Put('/update/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing course' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        thumbnail: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        ownerPhone: { type: 'string' },
      },
    },
  })
  public updateCourse(
    @Param('id', ValidateObjectIdPipe) courseId: string,
    @CurrentUser() payload: JwtPayload,
    @Body() body: UpdateCourseDto,
    @UploadedFile() thumbnail: Express.Multer.File,
  ) {
    return this.coursesService.updateCourse(
      courseId,
      body,
      payload.id || '',
      thumbnail,
    );
  }

  @Post('/:courseId/modules')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a module to a course' })
  public createModule(
    @Param('courseId', ValidateObjectIdPipe) courseId: string,
    @CurrentUser() payload: JwtPayload,
    @Body() body: CreateModuleDto,
  ) {
    return this.coursesService.createModule(courseId, payload.id || '', body);
  }

  @Post('/:courseId/modules/:moduleId/lessons')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('video'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add a lesson with video to a module' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        video: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        status: { type: 'string', enum: ['published', 'unpublished'] },
      },
      required: ['video', 'title'],
    },
  })
  public addLesson(
    @Param('courseId', ValidateObjectIdPipe) courseId: string,
    @Param('moduleId', ValidateObjectIdPipe) moduleId: string,
    @CurrentUser() payload: JwtPayload,
    @Body() body: AddLessonDto,
    @UploadedFile() video: Express.Multer.File,
  ) {
    if (!video) {
      throw new BadRequestException('يجب تحميل فيديو للدرس');
    }
    return this.coursesService.addLesson(
      courseId,
      moduleId,
      payload.id || '',
      body,
      video,
    );
  }
}
