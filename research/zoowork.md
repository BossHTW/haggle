# ZooWork (aka ZooClaw) Managed Agents - research (2026-10-03)
Status: Developer Preview (interface may change). Docs are Mintlify-ish static pages at zoowork.ai/docs/<section>/<page>.md (append .md for raw). Index: https://zoowork.ai/docs/llms.txt

## Packages / install
- TypeScript: `npm install @zoowork-ai/sdk` (ESM only, Node 20+ per README; quickstart says Node 22.20+; needs TS SDK >=0.10.0). Zero runtime deps, uses fetch.
- Python: `python -m pip install zoowork` (async, Python 3.10+, Python SDK >=0.5.0). `from zoowork import create_zoowork_client`
- Coding-assistant skills: `npx skills add SerendipityOneInc/zoowork-sdk-skills` (or `/plugin marketplace add SerendipityOneInc/zoowork-sdk-skills`, `/plugin install zoowork-agents@zoowork-skills`)
- Repos: SerendipityOneInc/zoowork-sdk-typescript, zoowork-sdk-skills, zoowork-platform-quickstarts (templates: customer-support, product-advisor, knowledge-assistant, research-assistant; offline demo mode w/o key), lynn-srp/zoowork-agents-docs (docs source), SerendipityOneInc/ZooData-Skills.

## Auth
- Create a Project API key at https://platform.zoowork.ai (Project > API keys; shown once; format `zwp_live_...`). Add prepaid funds (Org settings > Billing) before running.
- Env: `ZOOWORK_API_KEY`, optional `ZOOWORK_BASE_URL` (default `https://clawapi.ecap.gsmo.ai/service/v1`), `ZOOWORK_WEBHOOK_SECRET`.
- HTTP: `Authorization: Bearer <key>`. Backend only, never browser.

## Core flow (TS, copied from README/quickstart)
```ts
import { createZooworkClient, assistantText, isRunFinished, runOutcome } from '@zoowork-ai/sdk'
const zc = createZooworkClient({ apiKey: process.env.ZOOWORK_API_KEY })
const models = await zc.listModels()
const primary = models.find(m => m.selectable !== false)?.model
const agent = await zc.createAgent({ resource: { name: 'research-agent', model: { primary } } })
await zc.startAgent(agent.agent_id)          // createAgent yields a STOPPED agent; also zc.waitUntilRunning()
const session = await zc.createSession(agent.agent_id, {
  initial_events: [{ type: 'user.message', content: 'What can you do?' }]
})
for await (const ev of zc.streamEvents(agent.agent_id, session.session_id)) {
  process.stdout.write(assistantText(ev))
  if (isRunFinished(ev)) { console.log(`-> ${runOutcome(ev)}`); break }  // stream does NOT auto-close
}
```
Python methods: create_agent, start_agent, stop_agent, create_session, get_session, post_events, stream_events, list_models (async, `async with create_zoowork_client() as client`). Errors: `ZooworkError` (.status,.type,.request_id); no auto-retry; use idempotency keys.
Other TS helpers: listAllEvents() (REST truncates at 500 events), getAgent/updateAgent/deleteAgent(soft)/listAgents, listAgentSkills/putAgentSkill/deleteAgentSkill, listCustomToolCalls, unwrapWebhook(rawBytes,...). Every Session method takes agentId first.

## Agent definition
- `resource`: { name (required), model: { primary }, persona docs (AGENTS.md, SOUL.md etc. reach prompt), labels, tool_policy, mcp: [...] }. Exact field name for "instructions" = persona documents / `system_prompt` (UNCONFIRMED exact JSON shape; read https://zoowork.ai/docs/build/agents.md).
- updateAgent: partial; tool_policy and system_prompt replace wholesale; `config_version` bumps each write.
- Built-in tools (9): read, write, edit, apply_patch, exec, process, web_fetch, web_search, web_image_search. Control via `tool_policy` allow/deny; patterns `*`, exact, prefix e.g. `mcp__pricing__*`.
- Custom (app-executed) tools: up to 32; name, description, object JSON Schema, optional result timeout; agent pauses, you reply with `user.custom_tool_result` event.
- MCP servers: `resource.mcp` array, max 16; each {name (^[a-zA-Z0-9][a-zA-Z0-9-]{0,63}$), url (public HTTP, unauthenticated only), transport: 'streamable-http'|'sse', toolFilter?: string[<=64], exposure?: 'deferred'|'direct', context?: {meta:true,headers:false}}. Tools surface as `mcp__<server>__<tool>`. Private/authenticated services -> use custom tools.
- Also: Skills (platform skills), Memory, Agent Database (agent_db tool), Schedules, Files/artifacts, Webhooks, per-user agents, cloud sandbox.

## Events
- Inbound types only: user.message, user.interrupt, user.tool_confirmation, user.custom_tool_result, system.message (else 400 invalid_event).
- Outbound: agent.assistant, run.finished (status succeeded|failed|aborted; one per turn). Each event has opaque `cursor` (SSE id:) - persist and pass to resume; don't derive from seq. One stream can span multiple turns.

## Models
- Fetch dynamically via listModels() (fields: model, selectable, expiry/retirement, context window, expired_fallback_to). 409 `model_not_selectable` -> refresh catalog. Doc page says "Claude models"; homepage lists Claude, OpenAI, DeepSeek, Kimi, Gemini, GLM. Novita open-source models: UNCONFIRMED (no ZooWork source found linking Novita; Novita is a separate provider, novita.ai/models/llm).

## ZooData (separate product, zoodata.ai)
- Commerce data layer: Amazon + TikTok Shop (200M-500M+ products claimed, 2+ yrs history, 1B+ reviews). Agent-ready JSON.
- Base `https://api.zoodata.ai/openapi/v2`, POST JSON, `Authorization: Bearer $ZOODATA_API_KEY` (format `hms_live_xxx`; 1,000 free credits, 1 credit = 1 call).
- Endpoints seen: POST /products/search (13 preset modes, 40+ filters), /products/competitors, /markets/search, /realtime/product, /products/history (25 endpoints total per repo).
```bash
curl -X POST https://api.zoodata.ai/openapi/v2/markets/search -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"categoryPath": ["Electronics", "Headphones"]}'
```
- Install as agent skills: `npx skills add SerendipityOneInc/ZooData-Skills`. How ZooData is wired into a ZooWork Agent (built-in vs MCP vs skill): UNCONFIRMED; simplest is calling the REST API from a custom tool.

## RAG / files
- No managed RAG API documented for API keys. Docs (build/retrieval.md): connect your retriever either as a custom tool (your backend runs search, returns small array of {doc id, text, source url}) or a public MCP endpoint. Files/artifacts: workspace files in sandbox (build/files.md; not read in detail).

## Channels (WhatsApp/Slack/web link)
- Product site claims Slack, Teams, WhatsApp, web. BUT API docs (build/channels.md): no managed channel binding for Platform API keys; you wire it yourself: receive chat-platform message -> verify sender -> map to Agent/Session -> createSession / post user.message -> streamEvents -> send reply via platform API. Webhooks (build/webhooks.md) give signed event delivery. Web link sharing: UNCONFIRMED.

## URLs used
https://zoowork.ai/docs , /docs/llms.txt, /docs/build/{agents,mcp,events,channels,retrieval,tools}.md, /docs/reference/{models,python-sdk,capabilities}.md, /docs/get-started/{authentication,quickstart}.md, https://github.com/SerendipityOneInc/zoowork-sdk-typescript, zoowork-sdk-skills, zoowork-platform-quickstarts, ZooData-Skills, https://zoodata.ai/en, https://zoowork.ai/
