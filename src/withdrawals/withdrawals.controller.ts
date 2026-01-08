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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dtos/create-withdrawals.dto';
import { UpdateWithdrawalDto } from './dtos/update-withdrawals.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../utils/types';
import { AddAdminNoteDto } from './dtos/add-admin-note.dto';
import { ValidateObjectIdPipe } from '../pipes/validate-object-id.pipe';

@ApiTags('Withdrawals')
@Controller('/api/v1/withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all withdrawals for the current user' })
  public getAllUserWithdrawals(@CurrentUser() payload: JwtPayload) {
    return this.withdrawalsService.getAllUserWithdrawals(payload.id || '');
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a new withdrawal' })
  public createWithdrawal(
    @Body() body: CreateWithdrawalDto,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.withdrawalsService.createWithdrawal(body, payload.id || '');
  }

  @Get('/')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all withdrawals (Admin)' })
  public getAllWithdrawals() {
    return this.withdrawalsService.getAllWithdrawals();
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single withdrawal by ID' })
  public getSingleWithdrawal(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.withdrawalsService.getSingleWithdrawal(id);
  }

  @Put('/update/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a withdrawal request' })
  public updateWithdrawal(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Body() body: UpdateWithdrawalDto,
  ) {
    return this.withdrawalsService.updateWithdrawal(id, body);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a withdrawal request' })
  public deleteWithdrawal(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.withdrawalsService.deleteWithdrawal(id);
  }

  @Put('/add-admin-note/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add an administrative note to a withdrawal' })
  public addAdminNote(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Body() body: AddAdminNoteDto,
  ) {
    return this.withdrawalsService.addAdminNote(id, body);
  }
}
