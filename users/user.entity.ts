import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { CreateDateColumn } from 'typeorm/browser';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @CreateDateColumn()
  createdAt: Date;
}
