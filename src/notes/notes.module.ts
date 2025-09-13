import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from 'src/mail/mail.module';
import { NoteSchema } from 'src/schemas/note.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [NotesController],
  providers: [NotesService],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: 'Note', schema: NoteSchema }]),
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
export class NotesModule {}
