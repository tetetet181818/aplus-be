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
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dtos/create-announcement.dto';
import { RespondToAnnouncementDto } from './dtos/respond-to-announcement.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { JwtPayload } from '../utils/types';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

@Controller('announcements')
@UseGuards(AuthGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post(':courseId')
  create(
    @Param('courseId') courseId: string,
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
  findAll(@Param('courseId') courseId: string) {
    return this.announcementsService.getCourseAnnouncements(courseId);
  }

  @Post(':id/respond')
  respond(
    @Param('id') id: string,
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
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.announcementsService.deleteAnnouncement(id, req.user.id!);
  }
}
