# TinyFish - research (2026-10-03)
Docs index: https://docs.tinyfish.ai/llms.txt (append .md to pages). Sign up https://agent.tinyfish.ai/sign-up ($8 free credit); keys https://agent.tinyfish.ai/api-keys

## Products (one API key)
Agent (goal-based browser automation), Research, Search (free), Fetch (free), Browser (cloud Playwright/Puppeteer sessions), Monitor, Vault. Pricing (homepage): agent $0.016/step, browser $0.002/min; plans $19/$59/$129 per mo.

## Packages
- Python: `pip install tinyfish`
- TypeScript: `npm i @tiny-fish/sdk`
- CLI: `npm install -g @tiny-fish/cli`  (`tinyfish wallet status`)

## Auth
- REST header `X-API-Key: <key>`; SDKs read env `TINYFISH_API_KEY`. MCP uses OAuth 2.1.

## Endpoints
- Agent: POST https://agent.tinyfish.ai/v1/automation/run (blocking) | /run-async (returns run_id; poll GET /v1/runs/{id}) | /run-sse (stream STARTED, PROGRESS, COMPLETE). Cancel: POST /v1/runs/{id}/cancel (async/SSE only).
- Research: POST https://agent.tinyfish.ai/v1/automation/run-research; Search: GET https://api.search.tinyfish.ai; Fetch: POST https://api.fetch.tinyfish.ai; Browser: POST https://api.browser.tinyfish.ai
- Request: required `url`, `goal` (plain English). Optional `output_schema` (JSON Schema), `use_profile`/`profile_id`, proxy config, vault creds, `max_steps` (1-500, default 150).

## "Price of product X on site Y" -> structured JSON
Python (from quick-start):
```python
from tinyfish import TinyFish, CompleteEvent
client = TinyFish()
with client.agent.stream(
    url="https://scrapeme.live/shop",
    goal="Extract the first 2 product names and prices. Return as JSON."
) as stream:
    for event in stream:
        if isinstance(event, CompleteEvent):
            print(event.result_json)
```
Structured output: pass schema (schema is the contract; wrap arrays in an object field; avoid oneOf/additionalProperties/const/type arrays; use nullable):
```json
{"output_schema":{"type":"object","properties":{"title":{"type":"string"},"price":{"type":"number"}},"required":["title","price"]}}
```
Curl shape (assembled from reference, not a verbatim sample - UNCONFIRMED exact body): `curl -X POST https://agent.tinyfish.ai/v1/automation/run -H "X-API-Key: $TINYFISH_API_KEY" -H "Content-Type: application/json" -d '{"url":"https://site","goal":"Get price of X","output_schema":{...}}'`
Run object: run_id, status (PENDING|RUNNING|COMPLETED|FAILED|CANCELLED), goal, timestamps, `result`. COMPLETED != goal succeeded; check result (failure shape `{status:"failure", reason}`). Exact sync/TS response field names (e.g. result vs result_json): UNCONFIRMED beyond above.

## Rate limits / errors
- No numeric limits documented. 429 RATE_LIMIT_EXCEEDED (per-minute cap or pending-run concurrency), DAILY_LIMIT_EXCEEDED (resets Pacific). 401 MISSING/INVALID_API_KEY, 400 INVALID_INPUT, 402/403 INSUFFICIENT_CREDITS. Run errors: category SYSTEM_FAILURE (retry), AGENT_FAILURE, BILLING_FAILURE; codes SITE_BLOCKED (use stealth), TASK_FAILED, TIMEOUT.

## URLs used
https://www.tinyfish.ai, https://docs.tinyfish.ai/, /llms.txt, /quick-start.md, /authentication.md, /agent-api/reference.md, /key-concepts/structured-output.md, /key-concepts/runs.md, /error-codes.md. Cookbook: https://github.com/tinyfish-io/tinyfish-cookbook
