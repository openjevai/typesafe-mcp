import { TypeSafeClient, type Fetch } from "@typesafe-ai/sdk";
import { readConfig, type RuntimeConfig } from "./config.ts";
import { ConfigError } from "./errors.ts";

export interface ClientDeps {
  fetch?: Fetch;
  env?: Record<string, string | undefined>;
}

let cached: TypeSafeClient | undefined;

const defaultFetch: Fetch = (input, init) => globalThis.fetch(input, init);

export function getClient(deps: ClientDeps = {}): TypeSafeClient {
  if (cached) return cached;
  const cfg: RuntimeConfig = readConfig(deps.env);
  if (!cfg.apiKey) {
    const keyName = cfg.provider === "openjev" ? "OPENJEV_API_KEY" : "TYPESAFE_API_KEY";
    const keyUrl = cfg.provider === "openjev" ? "https://openjev.sh/dashboard" : "https://console.typesafe.ai";
    throw new ConfigError(
      `${keyName} is not set. Add it to the MCP server env in your host config (stdio spawn env). Get a key at ${keyUrl}. You can also set JEV_PROVIDER=openjev with OPENJEV_API_KEY to use OpenJEV, a free community gateway to the same Jev model.`,
    );
  }
  cached = new TypeSafeClient({
    apiKey: cfg.apiKey,
    baseURL: cfg.baseURL,
    defaultModel: cfg.defaultModel,
    timeout: cfg.timeoutMs,
    fetch: deps.fetch ?? defaultFetch,
    logLevel: "warn",
  });
  return cached;
}

/** Test helper: drop the cached client so the next `getClient` rebuilds. */
export function resetClient(): void {
  cached = undefined;
}
