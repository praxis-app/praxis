import { WinstonModule, utilities } from 'nest-winston';
import { format, transports } from 'winston';
import { Environment } from './shared.constants';

export const LoggerFactory = () => {
  const appTransport = new transports.File({
    filename: `${__dirname}/../../logs/app.log`,
    format: format.combine(format.timestamp(), format.json()),
  });

  const errorTransport = new transports.File({
    level: 'error',
    filename: `${__dirname}/../../logs/error.log`,
    format: format.combine(format.timestamp(), format.json()),
  });

  const consoleTransport = new transports.Console({
    format: format.combine(
      format.timestamp(),
      utilities.format.nestLike('Praxis', {
        colors: true,
        prettyPrint: true,
      }),
    ),
  });

  const allTransports =
    process.env.NODE_ENV === Environment.Production
      ? [appTransport, errorTransport]
      : [consoleTransport];

  return WinstonModule.createLogger({
    transports: allTransports,
    level: 'info',
  });
};
