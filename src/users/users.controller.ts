import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  HttpException,
  HttpStatus,
  Request,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
import { TrackToken, User } from './user.entity';
import { UsersService } from './users.service';
import { ParserObjectIdPipe } from '../utils/parsers';
import { AuthGuard } from 'src/auth/auth.guard';
import { AxiosResponse } from 'axios';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService, private readonly httpService: HttpService) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  getUserById(@Param('id', new ParserObjectIdPipe) id): Promise<User> {
    try {
      return this.usersService.getUserById(id);
    } catch(ex) {
      throw new HttpException('COMMON.UNEXPECTED_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Post('addToken')
  async trackToken(@Req() req: Request, @Body() token: TrackToken): Promise<User> {
    try {
      return this.usersService.addToken(req['user']._id, token);
    } catch (ex) {
      console.log(ex);
      throw new HttpException('COMMON.UNEXPECTED_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('deleteToken')
  async untrackToken(@Req() req: Request): Promise<User> {
    try {
      const token = req.body['token'];
      return this.usersService.deleteToken(req['user']._id, token);
    } catch (ex) {
      throw new HttpException('COMMON.UNEXPECTED_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    } 
  }

  @UseGuards(AuthGuard)
  @Post('token/getTokenInfo')
  getTokenInfo(@Req() req: Request): Promise<any> {
    const body = req.body;
    if (!body['query'])
      throw new HttpException('COMMON.NO_QUERY', HttpStatus.BAD_REQUEST);
    return new Promise(async (resolve, reject) => {
      try {
        let response: AxiosResponse;
        if (body['type'] === 'nft') {
          response = await this.httpService.axiosRef.post('nft/metadata?chain=eth', {
            addresses: [
              body['query']
            ]
          });
          resolve(response.data.map((t: any) => ({
            name: t.name,
            address: t.token_address,
            avatar: t.collection_logo,
          })))
        }
        else if (body['type'] === 'token') {
          if (body['query'].slice(0, 2) === '0x')
            response = await this.httpService.axiosRef.get('erc20/metadata?chain=eth&addresses%5B0%5D=' + body['query']);
          else response = await this.httpService.axiosRef.get('erc20/metadata?chain=eth&symbols%5B0%5D=' + body['query']);

          resolve(response.data.map((t: any) => ({
            name: t.name,
            address: t.address,
            avatar: t.logo,
          })))
        }
      } catch (ex) {
        reject('COMMON.UNEXPECTED_ERROR');
      }
    }) 
  }

  @UseGuards(AuthGuard)
  @Post('token/getNftPrices')
  getNftPrices(@Req() req: Request): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const user = req['user'];
        const data = await user.trackTokens?.filter(t => t.type === 'nft').map(async (t) => {
          try {
            const response = await this.httpService.axiosRef.get(`nft/${t.address}/lowestprice?chain=eth&marketplace=opensea`);
            return {
              ...t,
              price: response.data.price,
            }
          } catch (ex) {
            console.log(ex);
            return {
              ...t
            }
          }
        })
        resolve(data);
      } catch (ex) {
        console.log(ex);
        reject('COMMON.UNEXPECTED_ERROR');
      }
    }) 
  }

  @UseGuards(AuthGuard)
  @Post('token/getTokenPrices')
  getTokenPrices(@Req() req: Request): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const user = req['user'];
        const data = await Promise.all(user.trackTokens?.filter(t => t.type === 'token').map(async (t) => {
          try {
            const response = await this.httpService.axiosRef.get(`erc20/${t.address}/price?chain=eth&include=percent_change`);
            return {
              ...t,
              price: response.data.usdPrice,
            }
          } catch (ex) {
            console.log(ex);
          }
        }));
        console.log(data);
        resolve(data);
      } catch (ex) {
        reject('COMMON.UNEXPECTED_ERROR');
      }
    }) 
  }
}
