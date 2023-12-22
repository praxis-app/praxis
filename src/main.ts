import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { NestExpressApplication } from '@nestjs/platform-express';
import { writeFileSync } from 'fs';
import { printSchema } from 'graphql';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { join } from 'path';
import { AppModule } from './app.module';
import { MAX_IMAGE_COUNT, MAX_IMAGE_SIZE } from './images/image.constants';
import { LoggerFactory } from './common/logger.factory';
import { Environment } from './common/shared.constants';

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: LoggerFactory(),
  });
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api', { exclude: ['security.txt'] });
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.useGlobalPipes(new ValidationPipe());
  app.enable('trust proxy');
  app.enableCors({
    origin: configService.get<string>('CORS_ALLOWED_ORIGIN'),
    credentials: true,
  });

  app.use(
    graphqlUploadExpress({
      maxFiles: MAX_IMAGE_COUNT,
      maxFileSize: MAX_IMAGE_SIZE,
      overrideSendResponse: false,
    }),
  );

  await app.listen(process.env.SERVER_PORT || 3100);

  if (process.env.NODE_ENV === Environment.Development) {
    const { schema } = app.get(GraphQLSchemaHost);
    writeFileSync(join(process.cwd(), `./schema.graphql`), printSchema(schema));
  }
};

bootstrap();
