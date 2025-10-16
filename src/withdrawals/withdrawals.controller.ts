import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dtos/create-withdrawals.dto';
import { UpdateWithdrawalDto } from './dtos/update-withdrawals.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../utils/types';

@Controller('/api/v1/withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  public getAllUserWithdrawals(@CurrentUser() payload: JwtPayload) {
    return this.withdrawalsService.getAllUserWithdrawals(payload.id || '');
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  public createWithdrawal(
    @Body() body: CreateWithdrawalDto,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.withdrawalsService.createWithdrawal(body, payload.id || '');
  }

  @Get('/')
  @UseGuards(AuthGuard)
  public getAllWithdrawals() {
    return this.withdrawalsService.getAllWithdrawals();
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  public getSingleWithdrawal(@Param('id') id: string) {
    return this.withdrawalsService.getSingleWithdrawal(id);
  }
  @Put('/:id')
  @UseGuards(AuthGuard)
  public updateWithdrawal(
    @Param('id') id: string,
    @Body() body: UpdateWithdrawalDto,
  ) {
    return this.withdrawalsService.updateWithdrawal(id, body);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  public deleteWithdrawal(@Param('id') id: string) {
    return this.withdrawalsService.deleteWithdrawal(id);
  }
}
