import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class AppController {
  @Get()
  public landingPorject() {
    return 'the project is running';
  }
}
