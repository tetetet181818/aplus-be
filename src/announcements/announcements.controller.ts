import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dtos/create-announcement.dto';
import { RespondToAnnouncementDto } from './dtos/respond-to-announcement.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { JwtPayload } from '../utils/types';
import { ValidateObjectIdPipe } from '../pipes/validate-object-id.pipe';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

@ApiTags('Announcements')
@Controller('announcements')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post(':courseId')
  @ApiOperation({ summary: 'Create a new announcement for a course' })
  @ApiParam({ name: 'courseId', description: 'ID of the course' })
  create(
    @Param('courseId', ValidateObjectIdPipe) courseId: string,
    @Request() req: RequestWithUser,
    @Body() createAnnouncementDto: CreateAnnouncementDto,
  ) {
    return this.announcementsService.createAnnouncement(
      courseId,
      req.user.id!,
      createAnnouncementDto,
    );
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all announcements for a course' })
  @ApiParam({ name: 'courseId', description: 'ID of the course' })
  findAll(@Param('courseId', ValidateObjectIdPipe) courseId: string) {
    return this.announcementsService.getCourseAnnouncements(courseId);
  }

  @Post(':id/respond')
  @ApiOperation({
    summary: 'Respond to an announcement (e.g., answering a question)',
  })
  @ApiParam({ name: 'id', description: 'ID of the announcement' })
  respond(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Request() req: RequestWithUser,
    @Body() respondDto: RespondToAnnouncementDto,
  ) {
    return this.announcementsService.respondToAnnouncement(
      id,
      req.user.id!,
      respondDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an announcement' })
  @ApiParam({ name: 'id', description: 'ID of the announcement' })
  remove(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.announcementsService.deleteAnnouncement(id, req.user.id!);
  }
}
