import { IsNotEmpty } from 'class-validator';
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

export class TrackToken {
  _id?: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  type: string;
  @IsNotEmpty()
  address: string;
  avatar?: string;
  @IsNotEmpty()
  bookmark: boolean;
}

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  address: string;

  @Column({ type: 'json', nullable: true })
  trackTokens?: TrackToken[]

  @Column({ nullable: true })
  token?: string;
}
