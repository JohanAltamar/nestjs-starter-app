import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'permissions' })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @BeforeInsert()
  beforeInsertPermission() {
    this.name = this.name.toUpperCase().replaceAll(' ', '_');
  }
}
