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
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CompleteWithdrawalDto } from './dtos/completeWithdrawal.dto';

@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/overview')
  @UseGuards(AuthGuard)
  public getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('/users')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  deleteUser(@Param('id') id: string) {
    return this.dashboardService.deleteUser(id);
  }

  @Get('/users/stats')
  @UseGuards(AuthGuard)
  getUsersStats() {
    return this.dashboardService.getUsersStats();
  }

  @Get('users/search')
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
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  getNotesStats() {
    return this.dashboardService.getNotesStats();
  }

  @Post('/notes/:id/publish')
  @UseGuards(AuthGuard)
  MakeNotePublish(@Param('id') id: string) {
    return this.dashboardService.MakeNotePublish(id);
  }

  @Post('/notes/:id/unpublish')
  @UseGuards(AuthGuard)
  MakeNoteUnPublish(@Param('id') id: string) {
    return this.dashboardService.MakeNoteUnPublish(id);
  }

  @Get('/sales')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  getSalesStats() {
    return this.dashboardService.getSalesStats();
  }

  @Get('sales/:id')
  @UseGuards(AuthGuard)
  getSingleSale(@Param('id') id: string) {
    return this.dashboardService.getSingleSale(id);
  }

  @Get('/withdrawals')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  getWithdrawalsStats() {
    return this.dashboardService.getWithdrawalsStats();
  }

  @Get('/withdrawals/statuses')
  @UseGuards(AuthGuard)
  getWithdrawalsStatuses() {
    return this.dashboardService.getWithdrawalsStatuses();
  }

  @Get('/withdrawals/:id')
  @UseGuards(AuthGuard)
  getSingleWithdrawal(@Param('id') id: string) {
    return this.dashboardService.getSingleWithdrawal(id);
  }

  @Post('/withdrawals/:id/accepted')
  @UseGuards(AuthGuard)
  acceptedWithdrawal(@Param('id') id: string) {
    return this.dashboardService.acceptedWithdrawal(id);
  }

  @Post('/withdrawals/:id/rejected')
  @UseGuards(AuthGuard)
  rejectedWithdrawal(@Param('id') id: string) {
    return this.dashboardService.rejectedWithdrawal(id);
  }

  @Post('/withdrawals/:id/completed')
  @UseGuards(AuthGuard)
  completedWithdrawal(
    @Param('id') id: string,
    @Body() body: CompleteWithdrawalDto,
  ) {
    return this.dashboardService.completedWithdrawal(id, body);
  }
}
