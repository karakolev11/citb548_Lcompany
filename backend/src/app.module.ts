import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { ShipmentsModule } from './shipments/shipments.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    //Configure TypeORM
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['dist/**/*.entity.{ts,js}'],
      migrations: ['dist/src/migrations/*.js'],
      synchronize: false, // Use migrations instead of auto-sync
      migrationsRun: true,
      logging: true,
    }),

    //Modules
    CommonModule,
    UsersModule,
    AuthModule,
    CompanyModule,
    ShipmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log(process.env.DB_USER);
  }
}
