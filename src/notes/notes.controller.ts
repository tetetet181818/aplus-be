import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dtos/create-note.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../utils/types';
import { AddReviewDto } from './dtos/add-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('/api/v1/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  /**
   * Get all notes with pagination and sorting
   * @param page - Current page number
   * @param limit - Number of items per page
   * @param sortBy - Field to sort by (e.g., price, year, title, createdAt)
   * @param sortOrder - Sort order: asc or desc
   */

  @Get('/')
  getAllNotes(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc',
  ) {
    return this.notesService.getAllNotes(page, limit, sortBy, sortOrder);
  }

  @Get('/my-notes')
  @UseGuards(AuthGuard)
  public getUserNotes(@CurrentUser() payload: JwtPayload) {
    return this.notesService.getUserNotes(payload.id);
  }

  @Get('/purchased')
  @UseGuards(AuthGuard)
  public getPurchasedNotes(@CurrentUser() payload: JwtPayload) {
    return this.notesService.getPurchasedNotes(payload.id);
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  public createNote(
    @Body() body: CreateNoteDto,
    @CurrentUser() payload: JwtPayload,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    },
  ) {
    const pdf = files.file?.[0];
    const image = files.cover?.[0];
    return this.notesService.createNote(body, payload.id, image, pdf);
  }

  @Get(':id')
  public getSingleNote(@Param('id') id: string) {
    return this.notesService.getSingleNote(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  public deleteNote(
    @Param('id') noteId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.deleteNote(noteId, payload.id);
  }

  @Post('/:id/add-review')
  @UseGuards(AuthGuard)
  public addReview(
    @Param('id') noteId: string,
    @Body() body: AddReviewDto,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.addReview(noteId, {
      rating: body.rating,
      comment: body.comment,
      userId: payload.id,
      userName: payload.email,
    });
  }

  @Put('/:noteId/reviews/:reviewId')
  @UseGuards(AuthGuard)
  public updateReview(
    @Param('noteId') noteId: string,
    @Param('reviewId') reviewId: string,
    @Body() body: UpdateReviewDto,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.updateReview(noteId, reviewId, payload.id, body);
  }

  @Delete('/:noteId/reviews/:reviewId')
  @UseGuards(AuthGuard)
  public deleteReview(
    @Param('noteId') noteId: string,
    @Param('reviewId') reviewId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.deleteReview(noteId, reviewId, payload.id);
  }

  @Post('/:id/purchase')
  @UseGuards(AuthGuard)
  public purchaseNote(
    @Param('id') noteId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.purchaseNote(noteId, payload.id);
  }
  @Post('/:id/like')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public likeNote(
    @Param('id') noteId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.likeNote(noteId, payload.id);
  }

  @Post('/:id/unlike')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public unlikeNote(
    @Param('id') noteId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.unlikeNote(noteId, payload.id);
  }
  @Get('/:id/toggle-like')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public likeOrNot(
    @Param('id') noteId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.likeOrNot(noteId, payload.id);
  }
}
