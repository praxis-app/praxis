import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import * as cookieParser from 'cookie-parser';
import { writeFileSync } from 'fs';
import { printSchema } from 'graphql';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { join } from 'path';
import { AppModule } from './app.module';
import { LoggerFactory } from './shared/logger.factory';
import { Environment } from './shared/shared.constants';
import { MAX_IMAGE_COUNT, MAX_IMAGE_SIZE } from './images/image.constants';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory(),
    cors: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

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
