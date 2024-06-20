import { Controller, Get, Post, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import * as crypto from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Req() req: Request): Promise<User> {
    const address = req.body.address;
    try {
      let user = await this.authService.getUserByAddress(address);
      if (!user) 
        user = await this.authService.createUser({ address });
      this.authService.updateToken(address, crypto.randomBytes(48).toString('base64'));
      user = await this.authService.getUserByAddress(address);
      return user;
    } catch (ex) {
      throw new HttpException('COMMON.UNEXPECTED_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('logout')
  async logout(@Req() req: Request): Promise<User> {
    try {
      let user = req['user'];
      if (!user) 
        throw new HttpException('AUTH.NOT_FOUND', HttpStatus.NOT_FOUND);

      this.authService.updateToken(user.address, '');
      user = await this.authService.getUserByAddress(user.address);
      return user;
    } catch (ex) {
      throw new HttpException('COMMON.UNEXPECTED_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() req: Request): User {
    try {
      const user = req['user'];
      if (!user) {
        throw new HttpException('AUTH.NOT_FOUND', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (ex) {
      throw new HttpException('COMMON.UNEXPECTED_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
