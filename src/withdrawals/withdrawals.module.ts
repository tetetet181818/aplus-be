import { Module } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { WithdrawalsController } from './withdrawals.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from '../mail/mail.module';
import { WithdrawalSchema } from '../schemas/withdrawal.schema';
import { JwtModule } from '@nestjs/jwt';
import { UserSchema } from '../schemas/users.schema';
import { NotificationModule } from '../notification/notification.module';

@Module({
  controllers: [WithdrawalsController],
  providers: [WithdrawalsService],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'Withdrawal', schema: WithdrawalSchema },
      { name: 'User', schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get('JWT_EXPIRES_IN') || '1d',
          },
        };
      },
    }),
    MailModule,
    NotificationModule,
  ],
})
export class WithdrawalsModule {}
