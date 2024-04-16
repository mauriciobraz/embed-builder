import { Logger } from "tslog";
import { LogLevel } from "@sapphire/framework";

import { Environment } from "$lib/env";
import type { ILogger } from "@sapphire/framework";

export type LogMethods =
  | "trace"
  | "debug"
  | "error"
  | "fatal"
  | "info"
  | "warn";

const LOG_LEVELS = new Map<LogLevel, LogMethods>([
  [LogLevel.Trace, "trace"],
  [LogLevel.Debug, "debug"],
  [LogLevel.Error, "error"],
  [LogLevel.Fatal, "fatal"],
  [LogLevel.Info, "info"],
  [LogLevel.Warn, "warn"],
]);

export const logger = new Logger({
  name: "Logger",
  minLevel: Environment.LOG_LEVEL,
  prettyLogTemplate:
    "{{dateIsoStr}} {{logLevelName}} {{name}} {{fileNameWithLine}} ",
});

export const sapphireLoggerAdapter: ILogger = {
  debug: logger.debug.bind(logger),
  error: logger.error.bind(logger),
  fatal: logger.fatal.bind(logger),
  trace: logger.trace.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),

  write(level, ...values) {
    return (
      this.has(level) && logger[LOG_LEVELS.get(level) ?? "info"](...values)
    );
  },

  has(level) {
    return level >= Environment.LOG_LEVEL;
  },
};
