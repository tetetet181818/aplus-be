import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dtos/create-note.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/utils/types';
import { AddReviewDto } from './dtos/add-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';

@Controller('/api/v1/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('/')
  public getAllNotes() {
    return this.notesService.getAllNotes();
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

  @Post()
  @UseGuards(AuthGuard)
  public createNote(
    @Body() body: CreateNoteDto,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.createNote(body, payload.id);
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
}
