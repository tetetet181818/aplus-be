import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteSchema } from '../schemas/note.schema';
import { UserSchema } from '../schemas/users.schema';
import { SalesSchema } from '../schemas/sales.schema';
import { WithdrawalSchema } from '../schemas/withdrawal.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [
    MongooseModule.forFeature([
      { name: 'Note', schema: NoteSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Sales', schema: SalesSchema },
      { name: 'Withdrawal', schema: WithdrawalSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
          },
        };
      },
    }),
  ],
})
export class DashboardModule {}
