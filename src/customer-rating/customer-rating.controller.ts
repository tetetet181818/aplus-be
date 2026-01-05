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
import { ValidateObjectIdPipe } from '../pipes/validate-object-id.pipe';

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

  @Put('/publish/:id')
  @UseGuards(AuthGuard)
  publishRating(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.customerRatingService.publishRating(id);
  }

  @Put('/unpublish/:id')
  @UseGuards(AuthGuard)
  unPublishRating(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.customerRatingService.unPublishRating(id);
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Body() updateCustomerRatingDto: UpdateCustomerRatingDto,
  ) {
    return this.customerRatingService.update(id, updateCustomerRatingDto);
  }

  @Delete('/delete/:id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.customerRatingService.remove(id);
  }

  @Get('/user-rated-before')
  @UseGuards(AuthGuard)
  userRatedBefore(@CurrentUser() payload: JwtPayload) {
    return this.customerRatingService.userRatedBefore(payload.id || '');
  }

  @Get('/get-rating-dashboard')
  getCustomerRatingForDashboard() {
    return this.customerRatingService.getCustomerRatingForDashboard();
  }
}
