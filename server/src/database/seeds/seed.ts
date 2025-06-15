import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '@/app.module';
import { MainSeeder } from './main.seeder';

async function bootstrap() {
  try {
    console.log('Starting database seeding...');
    const app = await NestFactory.create(AppModule);

    const dataSource = app.get(DataSource);

    await MainSeeder.seed(dataSource);

    // Close the application when done
    await app.close();
    console.log('Seeding complete, application closed');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error during database seeding: ${error.message}`,
        error.stack,
      );
    }
    process.exit(1);
  }
}

bootstrap();
