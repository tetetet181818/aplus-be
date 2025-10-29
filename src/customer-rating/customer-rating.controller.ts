import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CustomerRatingService } from './customer-rating.service';
import { CreateCustomerRatingDto } from './dto/create-customer-rating.dto';
import { UpdateCustomerRatingDto } from './dto/update-customer-rating.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { JwtPayload } from '../utils/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('/api/v1/customer-rating')
export class CustomerRatingController {
  constructor(private readonly customerRatingService: CustomerRatingService) {}

  @Post('/create')
  @UseGuards(AuthGuard)
  create(
    @CurrentUser() payload: JwtPayload,

    @Body() createCustomerRatingDto: CreateCustomerRatingDto,
  ) {
    return this.customerRatingService.create(
      payload.id || '',
      payload.fullName || '',
      createCustomerRatingDto,
    );
  }

  @Get('/all')
  findAll() {
    return this.customerRatingService.findAll();
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateCustomerRatingDto: UpdateCustomerRatingDto,
  ) {
    return this.customerRatingService.update(id, updateCustomerRatingDto);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.customerRatingService.remove(id);
  }

  @Get('/user-rated-before')
  @UseGuards(AuthGuard)
  userRatedBefore(@CurrentUser() payload: JwtPayload) {
    return this.customerRatingService.userRatedBefore(payload.id || '');
  }
}
