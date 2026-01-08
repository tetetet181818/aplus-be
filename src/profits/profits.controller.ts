import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProfitsService } from './profits.service';

@ApiTags('Profits')
@Controller('api/v1/profits')
export class ProfitsController {
  constructor(private readonly profitsService: ProfitsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all platform profits (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'fullName', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  async getAllProfits(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('fullName') fullName: string,
    @Query('email') email: string,
  ) {
    return this.profitsService.getAllProfits(page, limit, fullName, email);
  }
}
