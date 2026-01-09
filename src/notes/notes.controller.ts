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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dtos/create-note.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../utils/types';
import { AddReviewDto } from './dtos/add-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateNoteDto } from './dtos/update.note.dto';
import { ValidateObjectIdPipe } from '../pipes/validate-object-id.pipe';
import { Express } from 'express';
import { CreatePaymentLinkDto } from './dtos/create-payment-link.dto';

@ApiTags('Notes')
@Controller('/api/v1/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('/')
  @ApiOperation({
    summary: 'Search and list all notes with pagination and filters',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'university', required: false, type: String })
  @ApiQuery({ name: 'collage', required: false, type: String })
  @ApiQuery({ name: 'year', required: false, type: String })
  @ApiQuery({ name: 'maxDownloads', required: false, type: Boolean })
  @ApiQuery({ name: 'minPrice', required: false, type: Boolean })
  @ApiQuery({ name: 'maxPrice', required: false, type: Boolean })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notes created by the current user' })
  public getUserNotes(@CurrentUser() payload: JwtPayload) {
    return this.notesService.getUserNotes(payload.id || '');
  }

  @Get('/likes-notes')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notes liked by the current user' })
  public getLikesNotes(@CurrentUser() payload: JwtPayload) {
    return this.notesService.getLikesNotes(payload.id || '');
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'note', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new note with a cover image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        note: { type: 'string', format: 'binary' },
        cover: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        subject: { type: 'string' },
        pagesNumber: { type: 'number' },
        year: { type: 'number' },
        college: { type: 'string' },
        university: { type: 'string' },
        termsAccepted: { type: 'string' },
      },
      required: ['note', 'title', 'price', 'termsAccepted'],
    },
  })
  public createNote(
    @Body() body: CreateNoteDto,
    @CurrentUser() payload: JwtPayload,
    @UploadedFiles()
    files: {
      note?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    },
  ) {
    const noteFile = files?.note?.[0];
    const coverFile = files?.cover?.[0];

    return this.notesService.createNote(
      body,
      payload.id || '',
      coverFile,
      noteFile,
    );
  }

  @Get('/best-sellers-notes')
  @ApiOperation({ summary: 'Get a list of best-selling notes' })
  public async bestSellersNotes() {
    return this.notesService.bestSellersNotes();
  }

  @Put('/update/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update note details' })
  public updateNote(
    @Param('id', ValidateObjectIdPipe) noteId: string,
    @CurrentUser() payload: JwtPayload,
    @Body() body: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(noteId, body, payload.id || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single note by ID' })
  public getSingleNote(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.notesService.getSingleNote(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a note' })
  public deleteNote(
    @Param('id', ValidateObjectIdPipe) noteId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.deleteNote(noteId, payload.id || '');
  }

  @Post('/:id/add-review')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a review to a note' })
  public addReview(
    @Param('id', ValidateObjectIdPipe) noteId: string,
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing review' })
  public updateReview(
    @Param('noteId', ValidateObjectIdPipe) noteId: string,
    @Param('reviewId', ValidateObjectIdPipe) reviewId: string,
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  public deleteReview(
    @Param('noteId', ValidateObjectIdPipe) noteId: string,
    @Param('reviewId', ValidateObjectIdPipe) reviewId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.deleteReview(noteId, reviewId, payload.id || '');
  }

  @Post('/:id/purchase')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase a note' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        invoice_id: { type: 'string' },
        status: { type: 'string' },
      },
      required: ['invoice_id'],
    },
  })
  public purchaseNote(
    @Param('id', ValidateObjectIdPipe) noteId: string,
    @CurrentUser() payload: JwtPayload,
    @Body() body: { invoice_id: string; status?: string },
  ) {
    return this.notesService.purchaseNote(noteId, payload.id || '', body);
  }

  @Post('/:id/like')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a note' })
  public likeNote(
    @Param('id', ValidateObjectIdPipe) noteId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.likeNote(noteId, payload.id || '');
  }

  @Post('/:id/unlike')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a note' })
  public unlikeNote(
    @Param('id', ValidateObjectIdPipe) noteId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.unlikeNote(noteId, payload.id || '');
  }

  @Get('/:id/toggle-like')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like status of a note or check if liked' })
  public likeOrNot(
    @Param('id', ValidateObjectIdPipe) noteId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.notesService.likeOrNot(noteId, payload.id || '');
  }

  @Post('/create-payment-link')
  @ApiOperation({ summary: 'Create a payment link for a note purchase' })
  @ApiBody({ type: CreatePaymentLinkDto })
  async createPaymentLink(@Body() body: CreatePaymentLinkDto) {
    return this.notesService.createPaymentLink(body);
  }
}
