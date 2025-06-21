import { Injectable } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ProductGateway } from './products.gateway';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
@Injectable()
export class ProductsService {
  private readonly s3Client = new S3Client({ region: 'us-east-1' });
  private readonly bucket = 'shoppy-products-2';

  constructor(
    private readonly prismaService: PrismaService,
    private readonly productGateway: ProductGateway,
  ) {}

  async createProduct(data: CreateProductRequest, userId: number) {
    const product = await this.prismaService.product.create({
      data: { ...data, userId },
    });
    this.productGateway.handleProductUpdated();
    return product;
  }

  async getProducts(status?: string) {
    const args: Prisma.ProductFindManyArgs = {};
    if (status === 'available') {
      args.where = { sold: false };
    }
    const products = await this.prismaService.product.findMany(args);
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

    return { ...product, imageExist: await this.imageExists(product.id) };
  }

  async uploadProductImage(productId: string, file: Buffer) {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: `${productId}.jpg`,
          Body: file,
        }),
      );
    } catch (error) {
      throw new Error(
        `Cannot upload productImage ${productId}, error: ${error}`,
      );
    }
  }

  async update(productId: number, data: Prisma.ProductUpdateInput) {
    await this.prismaService.product.update({ where: { id: productId }, data });
    this.productGateway.handleProductUpdated();
  }

  private async imageExists(productId: number) {
    try {
      const { Body } = await this.s3Client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: `${productId}.jpg` }),
      );
      return !!Body;
    } catch (err) {
      return false;
    }
  }
}
