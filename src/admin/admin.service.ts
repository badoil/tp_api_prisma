import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
//import { ADMIN } from '@prisma/client';
import { CreateShopDto } from './dto/create.shop.dto';
import { CreateAdminDto } from './dto/create.admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async findOne(name: string): Promise<any | undefined> {
    return this.prisma.aDMIN.findFirst({
      where: {
        ID: name,
      },
    });
  }

  async getShop(query) {
    // where 조건
    let where;
    console.log('query.keyword > ', query.keyword);
    if (query.keyword != '') {
      where = { SHOP_NAME: query.keyword };
    }
    const shopList = await this.prisma.sHOP.findMany({
      where: where,
    });
    return shopList;
  }

  async findByShopName(shopName) {
    return await this.prisma.sHOP.findMany({
      where: {
        SHOP_NAME: shopName,
      },
    });
  }

  async createAdmin(adminData: CreateAdminDto) {
    const password = await bcrypt.hash(adminData.PASSWORD, 12);
    const date = new Date();
    return this.prisma.aDMIN.create({
      data: {
        ID: adminData.ID,
        PASSWORD: password,
        REG_ID: 'SYSTEM',
        REG_DT: date,
      },
    });
  }

  async createShop(shopData: CreateShopDto, adminID?: string) {
    const password = await bcrypt.hash(shopData.password, 12);
    const date = new Date();

    return this.prisma.sHOP.create({
      data: {
        SHOP_NAME: shopData.shopName,
        PASSWORD: password,
        REG_ID: adminID || 'SYSTEM',
        REG_DT: date,
      },
    });
  }

  async updateShop(shopData) {
    const password = await bcrypt.hash(shopData.PASSWORD, 12);
    const date = new Date();

    const shop = await this.prisma.sHOP.findFirst({
      where: {
        SHOP_NAME: shopData.SHOP_NAME,
      },
    });
    if (!shop) {
      return new HttpException('NOT_JOIN', HttpStatus.FORBIDDEN);
    }

    return this.prisma.sHOP.update({
      where: {
        SHOP_KEY: shop.SHOP_KEY,
      },
      data: {
        SHOP_NAME: shopData.SHOP_NAME,
        PASSWORD: password,
        // REG_ID: 'SYSTEM',
        // REG_DT:
        UPD_ID: 'req.admin',
        UPD_DT: date,
      },
    });
  }

  async deleteShop(shopName, res: Response) {
    const shop = await this.prisma.sHOP.findFirst({
      where: {
        SHOP_NAME: shopName,
      },
    });
    if (!shop) {
      return new HttpException('NOT_JOIN', HttpStatus.FORBIDDEN);
    }

    const deletedShop = await this.prisma.sHOP.delete({
      where: {
        SHOP_KEY: shop.SHOP_KEY,
      },
    });

    return res.status(200).json({
      success: true,
      code: 'SUCCESS',
      msg: '삭제 되었습니다.',
    });
  }
}
