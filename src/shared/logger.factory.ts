import { WinstonModule, utilities } from 'nest-winston';
import { format, transports } from 'winston';

export const LoggerFactory = () => {
  const consoleTransport = new transports.Console({
    format: format.combine(
      format.timestamp(),
      utilities.format.nestLike('Praxis', {
        colors: true,
        prettyPrint: true,
      }),
    ),
  });

  const appTransport = new transports.File({
    filename: `${__dirname}/../../logs/app.log`,
    format: format.combine(format.timestamp(), format.json()),
  });

  const errorTransport = new transports.File({
    level: 'error',
    filename: `${__dirname}/../../logs/error.log`,
    format: format.combine(format.timestamp(), format.json()),
  });

  const getTransports = () => {
    if (process.env.PERSIST_WINSTON_LOGS === 'true') {
      return [consoleTransport, appTransport, errorTransport];
    }
    return [consoleTransport];
  };

  return WinstonModule.createLogger({
    transports: getTransports(),
    level: 'info',
  });
};
