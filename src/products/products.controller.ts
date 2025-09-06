import { Controller, Get } from '@nestjs/common';

@Controller('/api/products')
export class ProductsController {
  @Get('/')
  public getAllProducts() {
    return [
      { id: 1, title: '1 product' },
      { id: 2, title: '2 product' },
      { id: 3, title: '3 product' },
      { id: 4, title: '4 product' },
      { id: 5, title: '5 product' },
      { id: 6, title: '6 product' },
    ];
  }
}
