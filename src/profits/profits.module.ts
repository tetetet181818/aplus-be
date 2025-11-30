import { Module } from '@nestjs/common';
import { ProfitsService } from './profits.service';
import { ProfitsController } from './profits.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../schemas/users.schema';

@Module({
  controllers: [ProfitsController],
  providers: [ProfitsService],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
})
export class ProfitsModule {}
