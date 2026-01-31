import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env variables

export const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/src/migrations/*.js'],
    synchronize: false, // Use migrations instead of auto-sync
    migrationsRun: true,
    logging: true,
});