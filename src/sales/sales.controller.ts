import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSalesDto } from './dtos/create-sales.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('/api/v1/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('/create')
  public createSale(@Body() body: CreateSalesDto) {
    return this.salesService.createSale(body);
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
