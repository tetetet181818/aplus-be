import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { MailModule } from '../mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { SalesSchema } from '../schemas/sales.schema';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: 'Sales', schema: SalesSchema }]),
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
export class SalesModule {}
