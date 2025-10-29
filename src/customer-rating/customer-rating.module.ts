import { Module } from '@nestjs/common';
import { CustomerRatingService } from './customer-rating.service';
import { CustomerRatingController } from './customer-rating.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomerRatingSchema } from '../schemas/customer-rating.schema';

@Module({
  controllers: [CustomerRatingController],
  providers: [CustomerRatingService],
  imports: [
    MongooseModule.forFeature([
      { name: 'CustomerRating', schema: CustomerRatingSchema },
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
export class CustomerRatingModule {}
