import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSalesDto } from './dtos/create-sales.dto';

@Controller('/api/v1/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('/create')
  public createSale(@Body() body: CreateSalesDto) {
    return this.salesService.createSale(body);
  }

  @Get('/')
  public getAllSales() {
    return this.salesService.getAllSales();
  }

  @Get('/:id')
  public getSingleSale(@Param('id') id: string) {
    return this.salesService.getSingleSale(id);
  }
}
