import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dtos/create-withdrawals.dto';
import { UpdateWithdrawalDto } from './dtos/update-withdrawals.dto';

@Controller('/api/v1/withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post('/create')
  public createWithdrawal(@Body() body: CreateWithdrawalDto) {
    return this.withdrawalsService.createWithdrawal(body);
  }

  @Get('/')
  public getAllWithdrawals() {
    return this.withdrawalsService.getAllWithdrawals();
  }

  @Get('/:id')
  public getSingleWithdrawal(@Param('id') id: string) {
    return this.withdrawalsService.getSingleWithdrawal(id);
  }
  @Put('/:id')
  public updateWithdrawal(
    @Param('id') id: string,
    @Body() body: UpdateWithdrawalDto,
  ) {
    return this.withdrawalsService.updateWithdrawal(id, body);
  }

  @Delete('/:id')
  public deleteWithdrawal(@Param('id') id: string) {
    return this.withdrawalsService.deleteWithdrawal(id);
  }
}
