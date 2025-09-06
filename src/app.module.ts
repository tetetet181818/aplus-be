import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [ProductsModule],
})
export class AppModule {}
