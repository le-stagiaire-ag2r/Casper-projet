import { DataSource } from 'typeorm';
import config from './config';
import { Stake } from './entity/Stake';
import { Validator } from './entity/Validator';

export const AppDataSource = new DataSource({
  type: 'mysql',
  url: config.dbUri,
  synchronize: true, // Auto-create tables (disable in production!)
  logging: process.env.NODE_ENV === 'development',
  entities: [Stake, Validator],
  migrations: [],
  subscribers: [],
  timezone: 'Z', // Use UTC
});

// Initialize connection
export const initializeDatabase = async (): Promise<DataSource> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    return AppDataSource;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};
