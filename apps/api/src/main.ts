import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors();

  // PRD 5.1 (Etapa 06) / 7: contrato OpenAPI 3.1 servido em /docs.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('PsiFlow API')
    .setDescription(
      'API do PsiFlow — agenda, prontuário clínico, cobrança via WhatsApp e financeiro para psicólogos autônomos e clínicas. Todas as rotas (exceto auth e webhook) exigem Bearer JWT.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
