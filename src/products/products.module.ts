import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductGateway } from './products.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductGateway],
  exports: [ProductsService],
})
export class ProductsModule {}
