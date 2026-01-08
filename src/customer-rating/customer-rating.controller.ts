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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CustomerRatingService } from './customer-rating.service';
import { CreateCustomerRatingDto } from './dto/create-customer-rating.dto';
import { UpdateCustomerRatingDto } from './dto/update-customer-rating.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { JwtPayload } from '../utils/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ValidateObjectIdPipe } from '../pipes/validate-object-id.pipe';

@ApiTags('Customer Rating')
@Controller('/api/v1/customer-rating')
export class CustomerRatingController {
  constructor(private readonly customerRatingService: CustomerRatingService) {}

  @Post('/create')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a new customer rating' })
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
  @ApiOperation({ summary: 'Get all customer ratings' })
  findAll() {
    return this.customerRatingService.findAll();
  }

  @Put('/publish/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a rating to be visible' })
  @ApiParam({ name: 'id', description: 'ID of the rating' })
  publishRating(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.customerRatingService.publishRating(id);
  }

  @Put('/unpublish/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish a previously visible rating' })
  @ApiParam({ name: 'id', description: 'ID of the rating' })
  unPublishRating(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.customerRatingService.unPublishRating(id);
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing rating' })
  @ApiParam({ name: 'id', description: 'ID of the rating' })
  update(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Body() updateCustomerRatingDto: UpdateCustomerRatingDto,
  ) {
    return this.customerRatingService.update(id, updateCustomerRatingDto);
  }

  @Delete('/delete/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a customer rating' })
  @ApiParam({ name: 'id', description: 'ID of the rating' })
  remove(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.customerRatingService.remove(id);
  }

  @Get('/user-rated-before')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if the current user has already rated' })
  userRatedBefore(@CurrentUser() payload: JwtPayload) {
    return this.customerRatingService.userRatedBefore(payload.id || '');
  }

  @Get('/get-rating-dashboard')
  @ApiOperation({ summary: 'Get summary ratings for dashboard' })
  getCustomerRatingForDashboard() {
    return this.customerRatingService.getCustomerRatingForDashboard();
  }
}
