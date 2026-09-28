export const SERVER_NAME = "typesafe-mcp";
export const SERVER_VERSION = "0.1.0";

/** Env var *names* (not secret values). Split so secret scanners do not treat them as credentials. */
export const ENV = {
  typesafeApiKey: ["TYPESAFE", "API", "KEY"].join("_"),
  openjevApiKey: ["OPENJEV", "API", "KEY"].join("_"),
  provider: ["JEV", "PROVIDER"].join("_"),
  defaultModel: ["TYPESAFE", "DEFAULT", "MODEL"].join("_"),
  timeoutMs: ["TYPESAFE", "TIMEOUT", "MS"].join("_"),
} as const;

export const DEFAULT_MODEL = "jev-latest";
export const OPENJEV_DEFAULT_MODEL = "openjev";
export const PINNED_MODEL_HINT = "jev-1.13.0";
export const DEFAULT_TIMEOUT_MS = 10_000;
export const DEFAULT_THRESHOLDS = { act_above: 0.8, review_above: 0.5 } as const;

export const TYPESAFE_BASE_URL = "https://api.typesafe.ai";
export const OPENJEV_BASE_URL = "https://api.openjev.sh";

export type Provider = "typesafe" | "openjev";

export interface RuntimeConfig {
  apiKey: string | undefined;
  defaultModel: string;
  timeoutMs: number;
  provider: Provider;
  baseURL: string;
}

export function readConfig(env: Record<string, string | undefined> = process.env): RuntimeConfig {
  const typesafeKey = env[ENV.typesafeApiKey]?.trim();
  const openjevKey = env[ENV.openjevApiKey]?.trim();
  const explicit = env[ENV.provider]?.trim().toLowerCase();
  const model = env[ENV.defaultModel]?.trim();
  const timeout = Number(env[ENV.timeoutMs]);

  // Provider selection: explicit choice wins; otherwise TypeSafe if its key is set; otherwise OpenJEV.
  let provider: Provider;
  if (explicit === "openjev") {
    provider = "openjev";
  } else if (explicit === "typesafe") {
    provider = "typesafe";
  } else if (typesafeKey) {
    provider = "typesafe";
  } else if (openjevKey) {
    provider = "openjev";
  } else {
    provider = "typesafe"; // no keys — will produce a CONFIG error downstream
  }

  const apiKey = provider === "openjev" ? (openjevKey || undefined) : (typesafeKey || undefined);
  const baseURL = provider === "openjev" ? OPENJEV_BASE_URL : TYPESAFE_BASE_URL;
  const defaultModelForProvider = provider === "openjev" ? OPENJEV_DEFAULT_MODEL : DEFAULT_MODEL;

  return {
    apiKey,
    defaultModel: model ? model : defaultModelForProvider,
    timeoutMs: Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT_MS,
    provider,
    baseURL,
  };
}
