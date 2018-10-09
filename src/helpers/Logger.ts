import { createLogger, format, transports } from "winston";

const logger = createLogger({
  format: format.combine(
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    })
  ),
  level: "info",
  transports: [
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "combined.log" })
  ]
});

// Also, if outside PROD mode - output to console too
if (process.env.NODE_ENV !== "production" || process.env.DEBUG) {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss"
        }),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    })
  );
}

export default logger;
