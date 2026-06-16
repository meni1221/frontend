export type ClientLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type ClientLogEntry = {
  category: string;
  createdAt: string;
  level: ClientLogLevel;
  message: string;
  meta?: Record<string, unknown>;
  path: string;
  requestId: string;
  source: 'frontend';
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const SESSION_STORAGE_KEY = 'ishru-session';
const CLIENT_LOG_STORAGE_KEY = 'ishru-client-logs';
const maxStoredLogs = 200;

const levelWeight: Record<ClientLogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50,
};

const configuredLevel = (import.meta.env.VITE_LOG_LEVEL ?? 'info') as ClientLogLevel;

const shouldLog = (level: ClientLogLevel) =>
  levelWeight[level] >= (levelWeight[configuredLevel] ?? levelWeight.info);

const createRequestId = () => {
  if ('crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }

  return `client_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const getAccessToken = () => {
  try {
    const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }

    const session = JSON.parse(rawSession) as { accessToken?: string };
    return session.accessToken ?? null;
  } catch {
    return null;
  }
};

const sanitizeMeta = (meta: Record<string, unknown> = {}) => {
  const blockedKeys = ['password', 'passwordHash', 'accessToken', 'refreshToken', 'token', 'authorization'];

  return Object.entries(meta).reduce<Record<string, unknown>>((acc, [key, value]) => {
    acc[key] = blockedKeys.includes(key) ? '[redacted]' : value;
    return acc;
  }, {});
};

const storeLocalLog = (entry: ClientLogEntry) => {
  try {
    const rawLogs = window.localStorage.getItem(CLIENT_LOG_STORAGE_KEY);
    const logs = rawLogs ? JSON.parse(rawLogs) as ClientLogEntry[] : [];
    window.localStorage.setItem(CLIENT_LOG_STORAGE_KEY, JSON.stringify([entry, ...logs].slice(0, maxStoredLogs)));
  } catch {
    // Local logging must never break the UI.
  }
};

const sendRemoteLog = async (entry: ClientLogEntry) => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/logs/frontend`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
        'x-request-id': entry.requestId,
      },
      body: JSON.stringify({
        category: entry.category,
        level: entry.level,
        message: entry.message,
        meta: entry.meta,
        path: entry.path,
        requestId: entry.requestId,
      }),
    });
  } catch {
    // Remote logging is best-effort.
  }
};

type WriteLogOptions = {
  consoleLine?: string;
  forceConsole?: boolean;
  localOnly?: boolean;
};

const writeLog = (
  level: ClientLogLevel,
  category: string,
  message: string,
  meta?: Record<string, unknown>,
  options: WriteLogOptions = {},
) => {
  if (!shouldLog(level)) {
    return;
  }

  const entry: ClientLogEntry = {
    category,
    createdAt: new Date().toISOString(),
    level,
    message,
    meta: sanitizeMeta(meta),
    path: window.location.pathname,
    requestId: createRequestId(),
    source: 'frontend',
  };

  storeLocalLog(entry);
  if (!options.localOnly) {
    void sendRemoteLog(entry);
  }

  if (!options.forceConsole) {
    return;
  }

  const line = options.consoleLine ?? `[frontend] ${entry.category} ${entry.message}`;
  if (['error', 'fatal'].includes(level)) {
    console.error(line);
    return;
  }

  console.info(line);
};

export const appLogger = {
  component: (componentName: string, event: string, meta?: Record<string, unknown>) =>
    writeLog('info', 'component.lifecycle', `${componentName} ${event}`, { componentName, event, ...meta }, { localOnly: true }),
  debug: (category: string, message: string, meta?: Record<string, unknown>) => writeLog('debug', category, message, meta),
  error: (category: string, message: string, meta?: Record<string, unknown>) => writeLog('error', category, message, meta),
  fatal: (category: string, message: string, meta?: Record<string, unknown>) => writeLog('fatal', category, message, meta),
  info: (category: string, message: string, meta?: Record<string, unknown>) => writeLog('info', category, message, meta),
  request: (method: string, route: string, status: 'success' | 'failed', statusCode?: number) =>
    writeLog(
      status === 'success' ? 'info' : 'warn',
      'http.request',
      `${method} ${route} ${status}`,
      { method, route, status, statusCode },
      {
        consoleLine: [
          `[frontend] request`,
          `type: ${method}`,
          `request: ${route}`,
          `status: ${status}${statusCode ? ` ${statusCode}` : ''}`,
        ].join('\n'),
        forceConsole: true,
        localOnly: true,
      },
    ),
  warn: (category: string, message: string, meta?: Record<string, unknown>) => writeLog('warn', category, message, meta),
};

export const registerGlobalLogHandlers = () => {
  window.addEventListener('error', (event) => {
    appLogger.error('frontend.runtime', 'Unhandled frontend error', {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    appLogger.error('frontend.promise', 'Unhandled promise rejection', {
      reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
    });
  });
};
