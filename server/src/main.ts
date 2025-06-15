import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config/app-config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const appConfigService = app.get<AppConfigService>(AppConfigService);
  const SERVER_PORT: number = appConfigService.getPort();

  await app.listen(SERVER_PORT, () => {
    console.log(`App is running at http://localhost:${SERVER_PORT}`);
  });
}

bootstrap();
