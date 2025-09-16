import { Module } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { WithdrawalsController } from './withdrawals.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from 'src/mail/mail.module';
import { WithdrawalSchema } from 'src/schemas/withdrawal.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [WithdrawalsController],
  providers: [WithdrawalsService],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
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
    MailModule,
  ],
})
export class WithdrawalsModule {}
