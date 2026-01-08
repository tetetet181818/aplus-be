import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CompleteWithdrawalDto } from './dtos/completeWithdrawal.dto';
import { ValidateObjectIdPipe } from '../pipes/validate-object-id.pipe';

@ApiTags('Dashboard')
@Controller('api/v1/dashboard')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/overview')
  @ApiOperation({ summary: 'Get dashboard overview statistics' })
  public getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('/users')
  @ApiOperation({
    summary: 'Get all users with advanced filtering and pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'university', required: false, type: String })
  @ApiQuery({ name: 'fullName', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('university') university?: string,
    @Query('fullName') fullName?: string,
    @Query('email') email?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getAllUsers(
      pageNum,
      limitNum,
      university,
      fullName,
      email,
    );
  }

  @Delete('/users/:id')
  @ApiOperation({ summary: 'Delete a user from the dashboard' })
  deleteUser(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.dashboardService.deleteUser(id);
  }

  @Get('/users/stats')
  @ApiOperation({ summary: 'Get user-related statistics' })
  getUsersStats() {
    return this.dashboardService.getUsersStats();
  }

  @Get('users/search')
  @ApiOperation({ summary: 'Advanced user search with date ranges' })
  async searchUsers(
    @Query('fullName') fullName?: string,
    @Query('email') email?: string,
    @Query('university') university?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.dashboardService.searchUsers({
      fullName,
      email,
      university,
      dateFrom,
      dateTo,
      page,
      limit,
    });
  }

  @Get('/notes')
  @ApiOperation({ summary: 'Get all notes with filters and sorting' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'university', required: false, type: String })
  @ApiQuery({ name: 'collage', required: false, type: String })
  @ApiQuery({ name: 'year', required: false, type: String })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  getAllNotes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('university') university?: string,
    @Query('collage') collage?: string,
    @Query('year') year?: string,
    @Query('title') title?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getAllNotes(
      pageNum,
      limitNum,
      title || '',
      university || '',
      collage || '',
      year || '',
      sortBy || 'createdAt',
      sortOrder || 'desc',
    );
  }

  @Get('/notes/stats')
  @ApiOperation({ summary: 'Get notes-related statistics' })
  getNotesStats() {
    return this.dashboardService.getNotesStats();
  }

  @Post('/notes/:id/publish')
  @ApiOperation({ summary: 'Publish a note' })
  MakeNotePublish(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.dashboardService.MakeNotePublish(id);
  }

  @Post('/notes/:id/unpublish')
  @ApiOperation({ summary: 'Unpublish a note' })
  MakeNoteUnPublish(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.dashboardService.MakeNoteUnPublish(id);
  }

  @Get('/sales')
  @ApiOperation({ summary: 'Get all sales records with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'id', required: false, type: String })
  @ApiQuery({ name: 'invoiceId', required: false, type: String })
  getAllSales(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('id') id?: string,
    @Query('invoiceId') invoiceId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getAllSales(
      pageNum,
      limitNum,
      status,
      id,
      invoiceId,
    );
  }

  @Get('/sales/stats')
  @ApiOperation({ summary: 'Get sales-related statistics' })
  getSalesStats() {
    return this.dashboardService.getSalesStats();
  }

  @Get('sales/:id')
  @ApiOperation({ summary: 'Get a single sale record' })
  getSingleSale(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.dashboardService.getSingleSale(id);
  }

  @Get('/withdrawals')
  @ApiOperation({ summary: 'Get all withdrawal requests with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'iban', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getAllWithdrawals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('iban') iban?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getAllWithdrawals(
      pageNum,
      limitNum,
      status,
      iban,
      startDate,
      endDate,
    );
  }

  @Get('/withdrawals/stats')
  @ApiOperation({ summary: 'Get withdrawal-related statistics' })
  getWithdrawalsStats() {
    return this.dashboardService.getWithdrawalsStats();
  }

  @Get('/withdrawals/statuses')
  @ApiOperation({ summary: 'Get list of withdrawal statuses' })
  getWithdrawalsStatuses() {
    return this.dashboardService.getWithdrawalsStatuses();
  }

  @Get('/withdrawals/:id')
  @ApiOperation({ summary: 'Get a single withdrawal record' })
  getSingleWithdrawal(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.dashboardService.getSingleWithdrawal(id);
  }

  @Post('/withdrawals/:id/accepted')
  @ApiOperation({ summary: 'Accept a withdrawal request' })
  acceptedWithdrawal(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.dashboardService.acceptedWithdrawal(id);
  }

  @Post('/withdrawals/:id/rejected')
  @ApiOperation({ summary: 'Reject a withdrawal request' })
  rejectedWithdrawal(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.dashboardService.rejectedWithdrawal(id);
  }

  @Post('/withdrawals/:id/completed')
  @ApiOperation({ summary: 'Mark a withdrawal request as completed' })
  completedWithdrawal(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Body() body: CompleteWithdrawalDto,
  ) {
    return this.dashboardService.completedWithdrawal(id, body);
  }
}
