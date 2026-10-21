import type { EnvironmentProviders, Provider } from "@angular/core";
import {
  ErrorHandler,
  inject,
  isDevMode,
  provideAppInitializer,
} from "@angular/core";
import { Router } from "@angular/router";
import {
  browserTracingIntegration,
  createErrorHandler,
  init,
  TraceService,
} from "@sentry/angular";

export interface SentryConfigOptions {
  dsn?: string;
  enabled?: boolean;
  environment?: string;
  release?: string;
  tracePropagationTargets?: (string | RegExp)[];
  tracesSampleRate?: number;
}

interface WindowWithEnv {
  __ENV__?: {
    SENTRY_DSN?: string;
  };
  SENTRY_DSN?: string;
}

interface GlobalWithProcess {
  process?: {
    env?: Record<string, string | undefined>;
  };
}

const isBoolean = (val: unknown): val is boolean =>
  Object.prototype.toString.call(val) === "[object Boolean]";

/**
 * Resolves configured Sentry DSN from global window or environment variables if available.
 */
export const getSentryDsn = (): string => {
  if ("window" in globalThis) {
    /* SAFETY: Window object in browser may contain optional runtime environment settings */
    const win = globalThis.window as WindowWithEnv;
    if (win.__ENV__?.SENTRY_DSN) {
      return win.__ENV__.SENTRY_DSN;
    }
    if (win.SENTRY_DSN) {
      return win.SENTRY_DSN;
    }
  }

  /* SAFETY: globalThis in SSR or Node.js environments may contain process */
  const globalWithProc = globalThis as typeof globalThis & GlobalWithProcess;
  const globalProc = globalWithProc.process;
  if (globalProc?.env?.["SENTRY_DSN"]) {
    return globalProc.env["SENTRY_DSN"];
  }

  return "";
};

/**
 * Determines whether Sentry should be initialized conditionally:
 * Only if explicit DSN is provided or in production (with a valid DSN).
 */
export const shouldInitializeSentry = (
  options?: SentryConfigOptions
): boolean => {
  if (options && isBoolean(options.enabled)) {
    return options.enabled;
  }

  const dsn = options?.dsn ?? getSentryDsn();
  const isProduction = !isDevMode();

  return Boolean(dsn) && (Boolean(options?.dsn) || isProduction);
};

/**
 * Initializes Sentry error tracking and tracing conditionally.
 * Returns true if Sentry was initialized, false otherwise.
 */
export const initSentry = (
  options?: SentryConfigOptions,
  initializer: (opts: Parameters<typeof init>[0]) => void = init
): boolean => {
  if (!shouldInitializeSentry(options)) {
    return false;
  }

  const dsn = options?.dsn ?? getSentryDsn();
  const isProduction = !isDevMode();

  initializer({
    dsn,
    environment:
      options?.environment ?? (isProduction ? "production" : "development"),
    integrations: [browserTracingIntegration()],
    release: options?.release,
    tracePropagationTargets: options?.tracePropagationTargets ?? [
      "localhost",
      /^\/api/u,
    ],
    tracesSampleRate: options?.tracesSampleRate ?? (isProduction ? 0.2 : 1),
  });

  return true;
};

/**
 * Angular provider for Sentry ErrorHandler.
 */
export const provideSentryErrorHandler = (): Provider => ({
  provide: ErrorHandler,
  useValue: createErrorHandler({ showDialog: false }),
});

/**
 * Angular providers for Sentry TraceService and router tracing.
 */
export const provideSentryTracing = (): (Provider | EnvironmentProviders)[] => [
  {
    deps: [Router],
    provide: TraceService,
    useFactory: (router: Router) => new TraceService(router),
  },
  provideAppInitializer(() => {
    inject(TraceService, { optional: true });
  }),
];

/**
 * Combined provider setup for Sentry error handling and tracing.
 */
export const provideSentry = (
  options?: SentryConfigOptions
): (Provider | EnvironmentProviders)[] => {
  initSentry(options);
  return [provideSentryErrorHandler(), ...provideSentryTracing()];
};
