import { Body, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/users.schema';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
    private readonly config: ConfigService,
  ) {}

  public register(body: RegisterDto) {
    console.log(body.fullName);
    console.log(body.email);
    console.log(body.password);
    console.log(body.university);
  }
}
