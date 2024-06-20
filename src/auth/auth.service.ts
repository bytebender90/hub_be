import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  getUserByAddress(address: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ address });
  }

  getUserByToken(token: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ token });
  }

  createUser(data: { address: string }): Promise<User> {
    const newUser = this.usersRepository.create(data);
    return this.usersRepository.save(newUser);
  }

  updateToken(address: string, token: string): Promise<UpdateResult> {
    return this.usersRepository.update({ address }, { token });
  }
}
