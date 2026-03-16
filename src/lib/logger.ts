/**
 * Structured logger untuk server-side.
 * Di production, format JSON agar mudah di-parse oleh log aggregator (Vercel, Datadog, dll).
 * Di development, format human-readable.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
  timestamp: string;
}

const isDev = process.env.NODE_ENV === "development";

function formatError(err: unknown): LogEntry["error"] | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: isDev ? err.stack : undefined };
  }
  return { name: "UnknownError", message: String(err) };
}

function log(level: LogLevel, message: string, context?: string, data?: unknown, err?: unknown) {
  const entry: LogEntry = {
    level,
    message,
    context,
    data,
    error: formatError(err),
    timestamp: new Date().toISOString(),
  };

  if (isDev) {
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ""}`;
    const logFn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    logFn(prefix, message, data ?? "", err ?? "");
  } else {
    // Production: JSON structured log — Vercel captures stdout
    const logFn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    logFn(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (message: string, context?: string, data?: unknown) => log("debug", message, context, data),
  info: (message: string, context?: string, data?: unknown) => log("info", message, context, data),
  warn: (message: string, context?: string, data?: unknown) => log("warn", message, context, data),
  error: (message: string, context?: string, err?: unknown, data?: unknown) => log("error", message, context, data, err),
};

import { NextResponse } from "next/server";

/**
 * Logs an error and returns a standardized NextResponse.
 * Use this in API route catch blocks to replace bare console.error.
 */
export function apiError(
  context: string,
  err: unknown,
  message = "Terjadi kesalahan",
  status = 500
): NextResponse {
  logger.error(message, context, err);
  const msg = err instanceof Error ? err.message : message;
  // Never expose internal error details to client in production
  const clientMsg = process.env.NODE_ENV === "production" ? message : msg;
  return NextResponse.json({ error: clientMsg }, { status });
}
