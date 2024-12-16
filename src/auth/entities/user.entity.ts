import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Entities
import { Role } from 'src/roles/entities/role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false, nullable: true })
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('text', { nullable: true })
  provider: string;

  // TODO: roles relation;
  @ManyToMany(() => Role, (role) => role.users, { eager: true, cascade: true })
  @JoinTable({ name: 'users_roles_relations' })
  roles: Role[];

  @BeforeInsert()
  checkFIeldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFIeldsBeforeInsert();
  }
}
