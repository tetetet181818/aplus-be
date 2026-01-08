import {
  Body,
  Controller,
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
import { SalesService } from './sales.service';
import { CreateSalesDto } from './dtos/create-sales.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../utils/types';
import { ValidateObjectIdPipe } from '../pipes/validate-object-id.pipe';

@ApiTags('Sales')
@Controller('/api/v1/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('/get-user-statistics-sales')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sales statistics for the current user' })
  public getUserStatisticsSales(@CurrentUser() payload: JwtPayload) {
    return this.salesService.getUserStatisticsSales(payload.id || '');
  }

  @Post('/create')
  @ApiOperation({ summary: 'Create a new sale record' })
  public createSale(@Body() body: CreateSalesDto) {
    return this.salesService.createSale(body);
  }

  @Get('/get-sales-user')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sales by user ID with pagination' })
  @ApiQuery({ name: 'page', type: Number })
  @ApiQuery({ name: 'limit', type: Number })
  public getSalesByUserId(
    @CurrentUser() payload: JwtPayload,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.salesService.getSalesByUserId(payload.id || '', page, limit);
  }

  @Get('/get-sales-user-stats')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detailed sales stats for the current user' })
  public getSalesUserStats(@CurrentUser() payload: JwtPayload) {
    return this.salesService.getSalesUserStats(payload.id || '');
  }

  @Get('/')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all sales records (Admin)' })
  public getAllSales() {
    return this.salesService.getAllSales();
  }

  @Get('/get-sales-note/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sales details for a specific note' })
  @ApiQuery({ name: 'page', type: Number })
  @ApiQuery({ name: 'limit', type: Number })
  getDetailsSalesNote(
    @CurrentUser() payload: JwtPayload,
    @Param('id', ValidateObjectIdPipe) id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.salesService.getDetailsSalesNote(
      payload.id || '',
      id,
      page,
      limit,
    );
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single sale record by ID' })
  public getSingleSale(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.salesService.getSingleSale(id);
  }
}
