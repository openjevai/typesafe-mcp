# OpenJEV Support

This fork of [typesafe-mcp](https://github.com/MarkChu-git/typesafe-mcp) adds optional support for [OpenJEV](https://openjev.sh), a free community gateway to the same Jev model built by [TypeSafe](https://typesafe.ai). TypeSafe remains the default provider; OpenJEV is opt-in.

## What was added

| File | Change |
| --- | --- |
| `src/config.ts` | Added `OPENJEV_API_KEY`, `JEV_PROVIDER` env vars, `OPENJEV_BASE_URL`, `OPENJEV_DEFAULT_MODEL` constants, and provider selection logic in `readConfig()`. |
| `src/client.ts` | Passes `baseURL` to `TypeSafeClient` constructor; updated `ConfigError` message to mention both providers. |
| `src/errors.ts` | Added HTTP 503 alongside 529 for `OVERLOADED`; `redact()` now also redacts `OPENJEV_API_KEY`; updated CONFIG/NETWORK hints. |
| `examples/stdio.openjev.mcp.json` | New example config for OpenJEV. |
| `README.md` | Added OpenJEV note after the intro. |

TypeSafe code, defaults, and behaviour are unchanged. No TypeSafe import, endpoint, model id, or env var was renamed or removed.

## Provider selection rule

1. **Explicit choice wins**: `JEV_PROVIDER=openjev` or `JEV_PROVIDER=typesafe`.
2. **Otherwise**, if `TYPESAFE_API_KEY` is set → TypeSafe (default, unchanged).
3. **Otherwise**, if only `OPENJEV_API_KEY` is set → OpenJEV.

Anyone with a `TYPESAFE_API_KEY` sees zero behaviour change.

## How to configure

Set `OPENJEV_API_KEY` (from https://openjev.sh/dashboard) and optionally `JEV_PROVIDER=openjev` in your MCP host config:

```json
{
  "mcpServers": {
    "jev": {
      "command": "bun",
      "args": ["run", "/ABSOLUTE/PATH/TO/typesafe-mcp/src/index.ts"],
      "env": {
        "OPENJEV_API_KEY": "<your-openjev-key>",
        "JEV_PROVIDER": "openjev"
      }
    }
  }
}
```

When using OpenJEV, the default model is `openjev` (not `jev-latest`). The `TYPESAFE_DEFAULT_MODEL` env var still overrides the default if set.

## API mapping

| | TypeSafe (default) | OpenJEV |
| --- | --- | --- |
| Endpoint | `https://api.typesafe.ai` | `https://api.openjev.sh` |
| Model | `jev-latest` | `openjev` |
| Key env | `TYPESAFE_API_KEY` | `OPENJEV_API_KEY` |
| Overload status | 529 | 503 (also 429) |

Both use the same `/v1/systemone` request/response contract.

## Verification

A live `POST https://api.openjev.sh/v1/systemone` request with model `openjev`, state `ping`, and one noul question returned HTTP 200. No `api.typesafe.ai` default was introduced or left in the codebase (TypeSafe remains the default base URL only when the TypeSafe provider is selected).

## Upstream

Original project: https://github.com/MarkChu-git/typesafe-mcp by [@MarkChu-git](https://github.com/MarkChu-git).
