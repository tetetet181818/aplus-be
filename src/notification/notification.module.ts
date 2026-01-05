import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from '../schemas/notification.schema';
import { NotificationController } from './notification.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationService],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
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
  ],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
