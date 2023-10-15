import { WinstonModule, utilities } from 'nest-winston';
import { format, transports } from 'winston';

export const LoggerFactory = () =>
  WinstonModule.createLogger({
    level: 'info',

    transports: [
      new transports.File({
        filename: `${__dirname}/../../logs/app.log`,
        format: format.combine(format.timestamp(), format.json()),
      }),

      new transports.File({
        level: 'error',
        filename: `${__dirname}/../../logs/error.log`,
        format: format.combine(format.timestamp(), format.json()),
      }),

      new transports.Console({
        format: format.combine(
          format.timestamp(),

          // TODO: Remove when ready
          // format.cli(),
          // format.splat(),
          // format.align(),

          format.printf((info) => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
          }),
          utilities.format.nestLike('Praxis', {
            colors: true,
            prettyPrint: true,
          }),
        ),
      }),
    ],
  });
