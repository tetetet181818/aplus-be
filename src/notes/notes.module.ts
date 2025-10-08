import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from '../mail/mail.module';
import { NoteSchema } from '../schemas/note.schema';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryConfig } from '../cloudinary/cloudinary.config';
import { UserSchema } from '../schemas/users.schema';
import { NotificationModule } from '../notification/notification.module';
import { SalesModule } from '../sales/sales.module';

@Module({
  controllers: [NotesController],
  providers: [NotesService],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'Note', schema: NoteSchema },
      { name: 'User', schema: UserSchema },
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
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
    MailModule,
    NotificationModule,
    SalesModule,
  ],
})
export class NotesModule {
  constructor() {
    CloudinaryConfig();
  }
}
