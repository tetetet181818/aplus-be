import { Controller, Get, Query } from '@nestjs/common';
import { ProfitsService } from './profits.service';

@Controller('api/v1/profits')
export class ProfitsController {
  constructor(private readonly profitsService: ProfitsService) {}

  @Get()
  async getAllProfits(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('fullName') fullName: string,
    @Query('email') email: string,
  ) {
    return this.profitsService.getAllProfits(page, limit, fullName, email);
  }
}
