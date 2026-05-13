import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

export type ProductImageUsage = 'gallery' | 'try_on';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productId: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  url: string;

  @Column()
  publicId: string;

  @Column({ nullable: true })
  altText: string;

  @Column({ default: 0 })
  position: number;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: true })
  isGallery: boolean;

  @Column({ default: 'gallery' })
  usage: ProductImageUsage;

  @Column({ nullable: true })
  tryOnSize: string | null;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  bytes: number;

  @Column({ nullable: true })
  format: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
