import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsModule } from './collections/collections.module';
import { ProductsModule } from './products/products.module';
import { NewsletterModule } from './newsletter/newsletter.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // PostgreSQL via TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'hichic_user'),
        password: config.get<string>('DB_PASSWORD', 'hichic_pass'),
        database: config.get<string>('DB_NAME', 'hichic_db'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    ProductsModule,
    CollectionsModule,
    NewsletterModule,
  ],
})
export class AppModule {}
