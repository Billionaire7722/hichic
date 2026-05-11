import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  nameVi: string;

  @Column()
  category: string;

  @Column()
  categoryVi: string;

  @Column()
  price: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  descriptionVi: string;

  @Column()
  image: string;

  /** 'shirt' | 'blazer' | 'trousers' | 'skirt' */
  @Column({ nullable: true })
  garment: string;

  /** 'upper' | 'lower' */
  @Column({ nullable: true })
  region: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
