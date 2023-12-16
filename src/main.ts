import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { writeFileSync } from 'fs';
import { printSchema } from 'graphql';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { join } from 'path';
import { AppModule } from './app.module';
import { MAX_IMAGE_COUNT, MAX_IMAGE_SIZE } from './images/image.constants';
import { LoggerFactory } from './shared/logger.factory';
import { Environment } from './shared/shared.constants';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory(),
    cors: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.getHttpAdapter().getInstance().disable('x-powered-by');

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
