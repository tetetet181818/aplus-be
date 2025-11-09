import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSalesDto } from './dtos/create-sales.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/utils/types';

@Controller('/api/v1/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('/create')
  public createSale(@Body() body: CreateSalesDto) {
    return this.salesService.createSale(body);
  }

  @Get('/get-sales-user')
  @UseGuards(AuthGuard)
  public getSalesByUserId(
    @CurrentUser() payload: JwtPayload,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.salesService.getSalesByUserId(payload.id || '', page, limit);
  }
  @Get('/get-sales-user-stats')
  @UseGuards(AuthGuard)
  public getSalesUserStats(@CurrentUser() payload: JwtPayload) {
    return this.salesService.getSalesUserStats(payload.id || '');
  }

  @Get('/')
  @UseGuards(AuthGuard)
  public getAllSales() {
    return this.salesService.getAllSales();
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  public getSingleSale(@Param('id') id: string) {
    return this.salesService.getSingleSale(id);
  }
}
