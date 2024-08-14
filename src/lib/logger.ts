const enum LogLevel {
  info,
  warn,
  error
}

function getLogger() {
  const methods = ['info', 'warn', 'error'] as const;
  const style = ['color: green;', 'color: orange;', 'color: red;'];
  const logLevel = import.meta.env.DEV ? LogLevel.info : LogLevel.error;
  const namePrefix = '[Pixiv Downlaoder] ';

  function log(level: LogLevel, args: unknown[]) {
    if (logLevel <= level) console[methods[level]]('%c[Pixiv Downloader]', style[level], ...args);
  }

  return {
    info(...args: unknown[]) {
      log(LogLevel.info, args);
    },
    warn(...args: unknown[]) {
      log(LogLevel.warn, args);
    },
    error(...args: unknown[]) {
      log(LogLevel.error, args);
    },
    time(label: string) {
      console.time(namePrefix + label);
    },
    timeLog(label: string) {
      console.timeLog(namePrefix + label);
    },
    timeEnd(label: string) {
      console.timeEnd(namePrefix + label);
    },
    throw(msg: string, Err?: typeof Error) {
      if (Err) {
        throw new Err(`${namePrefix}${msg}`);
      } else {
        throw new Error(`${namePrefix}${msg}`);
      }
    }
  };
}

export const logger = getLogger();
