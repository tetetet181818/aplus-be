import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { MailModule } from './mail/mail.module';
import { NotificationModule } from './notification/notification.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesModule } from './sales/sales.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DashboardModule } from './dashboard/dashboard.module';
@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('NODE_ENV') === 'development'
            ? configService.get<string>('DEVELOPMENT_DATABASE_URL')
            : configService.get<string>('PRODUCTION_DATABASE_URL'),
      }),
    }),
    AuthModule,
    NotesModule,
    MailModule,
    NotificationModule,
    SalesModule,
    WithdrawalsModule,
    CloudinaryModule,
    DashboardModule,
    NotificationModule,
  ],
})
export class AppModule {}
