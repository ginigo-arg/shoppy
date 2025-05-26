import { Injectable } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PRODUCT_IMAGES } from './dto/product-images';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createProduct(data: CreateProductRequest, userId: number) {
    return this.prismaService.product.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getProducts() {
    const products = await this.prismaService.product.findMany();
    return Promise.all(
      products.map(async (product) => ({
        ...product,
        imageExists: await this.imageExists(product.id),
      })),
    );
  }

  async getProductById(productId: number) {
    const product = await this.prismaService.product.findUniqueOrThrow({
      where: { id: productId },
    });
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    return {
      ...product,
      imageExist: await this.imageExists(product.id),
    };
  }

  private async imageExists(productId: number) {
    try {
      await fs.access(
        join(`public/images/products/${productId}.jpg`),
        fs.constants.F_OK,
      );
      return true;
    } catch (err) {
      return false;
    }
  }
}
