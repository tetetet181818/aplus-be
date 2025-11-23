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
import { UpdateNoteDto } from './dtos/update.note.dto';
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
    @Query('title') title: string,
    @Query('university') university: string,
    @Query('collage') collage: string,
    @Query('year') year: string,
    @Query('maxDownloads') maxDownloads: boolean,
    @Query('minPrice') minPrice: boolean,
    @Query('maxPrice') maxPrice: boolean,
  ) {
    return this.notesService.getAllNotes(
      page,
      limit,
      sortBy,
      sortOrder,
      title,
      university,
      collage,
      year,
      maxDownloads,
      minPrice,
      maxPrice,
    );
  }

  @Get('/my-notes')
  @UseGuards(AuthGuard)
  public getUserNotes(@CurrentUser() payload: JwtPayload) {
    return this.notesService.getUserNotes(payload.id || '');
  }

  @Get('/likes-notes')
  @UseGuards(AuthGuard)
  public getLikesNotes(@CurrentUser() payload: JwtPayload) {
    return this.notesService.getLikesNotes(payload.id || '');
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }]))
  public createNote(
    @Body() body: CreateNoteDto,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.createNote(body, payload.id || '');
  }

  @Get('/best-sellers-notes')
  public async bestSellersNotes() {
    return this.notesService.bestSellersNotes();
  }

  @Put('/update/:id')
  @UseGuards(AuthGuard)
  public updateNote(
    @Param('id') noteId: string,
    @CurrentUser() payload: JwtPayload,
    @Body() body: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(noteId, body, payload.id || '');
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
    return this.notesService.deleteNote(noteId, payload.id || '');
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
      userId: payload.id || '',
      userName: payload.fullName || '',
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
    return this.notesService.updateReview(
      noteId,
      reviewId,
      payload.id || '',
      body,
    );
  }

  @Delete('/:noteId/reviews/:reviewId')
  @UseGuards(AuthGuard)
  public deleteReview(
    @Param('noteId') noteId: string,
    @Param('reviewId') reviewId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.deleteReview(noteId, reviewId, payload.id || '');
  }

  @Post('/:id/purchase')
  @UseGuards(AuthGuard)
  public purchaseNote(
    @Param('id') noteId: string,
    @CurrentUser() payload: JwtPayload,
    @Body() body: { invoice_id: string; status?: string },
  ) {
    return this.notesService.purchaseNote(noteId, payload.id || '', body);
  }
  @Post('/:id/like')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public likeNote(
    @Param('id') noteId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.likeNote(noteId, payload.id || '');
  }

  @Post('/:id/unlike')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public unlikeNote(
    @Param('id') noteId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.unlikeNote(noteId, payload.id || '');
  }
  @Get('/:id/toggle-like')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public likeOrNot(
    @Param('id') noteId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.likeOrNot(noteId, payload.id || '');
  }

  @Post('/create-payment-link')
  async createPaymentLink(
    @Query('noteId') noteId: string,
    @Query('userId') userId: string,
    @Query('amount') amount: string,
  ) {
    return this.notesService.createPaymentLink({
      noteId,
      userId,
      amount,
    });
  }
}
