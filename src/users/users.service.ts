import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectID, Repository } from 'typeorm';
import { User, TrackToken } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  getUserById(_id: ObjectID): Promise<User> {
    return this.usersRepository.findOneBy({ _id });
  }

  addToken(_id: ObjectID, data: TrackToken): Promise<User> {  
    return new Promise(async (resolve, reject) => {
      try {
        let user = await this.usersRepository.findOneBy({ _id });
        if (!user) {
          reject('USER.NOT_FOUND');
        }
        
        if (!user.trackTokens)
          user.trackTokens = [];

        user.trackTokens.push(data);

        user = await this.usersRepository.save(user);
        resolve(user);
      } catch (ex) {
        reject('COMMON.UNEXPECTED_ERROR');
      }
    });
  }

  deleteToken(_id: ObjectID, token: string): Promise<User> {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await this.usersRepository.findOneBy({ _id });
        if (!user) {
          reject('USER.NOT_FOUND');
        }
        
        if (!user.trackTokens)
          user.trackTokens = [];

        const tokenIndex = user.trackTokens.findIndex(t => t.address === token);
        user.trackTokens.splice(tokenIndex, 1);

        user = await this.usersRepository.save(user);
        resolve(user);
      } catch (ex) {
        reject('COMMON.UNEXPECTED_ERROR');
      } 
    });
  }
}
