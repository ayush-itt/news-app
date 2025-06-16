import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { Constants } from './common/constants';
import { AppConfigService } from './config/app-config/app-config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const appConfigService = app.get<AppConfigService>(AppConfigService);
  const SERVER_PORT: number = appConfigService.getPort();

  const config = new DocumentBuilder()
    .setTitle('NEWS APP API')
    .setDescription('NEWS APP APIs available')
    .addBearerAuth(
      {
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      Constants.SWAGGER_ACCESS_TOKEN,
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(Constants.APP_SWAGGER_URL, app, document);

  app.use(cookieParser());
  app.use(json());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    secure: false,
    origin: '*',
    credentials: true,
  });

  await app.listen(SERVER_PORT, () => {
    console.log(`Application is running at http://localhost:${SERVER_PORT}`);
    console.log(
      `Swagger is running at http://localhost:${SERVER_PORT}/${Constants.APP_SWAGGER_URL}`,
    );
  });
}

void bootstrap();
