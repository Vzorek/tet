type LogLevel = 'error' | 'warning' | 'info' | 'http' | 'debug' | 'verbose' | 'silly';

type LogLevels = {
    [key: string]: LogLevel;
};

const defaultLogLevel: LogLevel = 'info';

const logLevels: Readonly<LogLevels> = {
    'main': 'info',
};

export function getLogLevel(tag: string): LogLevel {
    return logLevels[tag] || defaultLogLevel;
}
