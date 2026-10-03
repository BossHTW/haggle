# Moss - research (2026-10-03)
Docs index: https://docs.moss.dev/llms.txt (append .md). Portal: https://portal.usemoss.dev . Main repo: https://github.com/usemoss/moss (also usemoss/moss-samples, moss-skills, pipecat-moss). NOTE: repo "usemoss/GALLERYHACKS" returned 404 and is not in the org's public list - UNCONFIRMED/not found.

## Packages (NOTE inconsistencies across sources)
- Python: `pip install moss` (async)
- Node/server JS: docs say `npm install @moss-js/moss` (homepage says `@moss-dev/moss` - UNCONFIRMED which; docs quickstart + browser-vs-node page both say @moss-js/moss, trust that)
- Browser (WASM): `npm install @moss-dev/moss-web` - runs fully local, WASM + embedding model download on first use, no sessions, needs custom authenticator for production
- Also Swift, Elixir, C SDKs; integrations LangChain, Vercel AI SDK, DSPy, LiveKit, Pipecat, MCP server, CLI.

## Auth
Project ID + project key from portal. Env used in docs: MOSS_PROJECT_ID, MOSS_PROJECT_KEY. Server: `new MossClient(projectId, projectKey)`. Browser/untrusted: `new MossClient(projectId, authenticator)` (custom authenticator backed by your server; see docs/reference/js/custom-authenticator.md).

## Node quickstart (verbatim)
```ts
import { MossClient, DocumentInfo } from '@moss-js/moss'
const client = new MossClient(process.env.MOSS_PROJECT_ID!, process.env.MOSS_PROJECT_KEY!)
const documents: DocumentInfo[] = [
  { id: 'doc1', text: 'How do I track my order? ...', metadata: { category: 'shipping' } },
]
await client.createIndex('faqs', documents, { modelId: 'moss-minilm' })
await client.loadIndex('faqs')            // downloads index into memory; required before query
const results = await client.query('faqs', 'How do I return a damaged product?', { topK: 3 })
console.log(results.docs[0])             // {id, text, score, metadata}
```
## Python (verbatim)
```python
from moss import MossClient, DocumentInfo, QueryOptions
client = MossClient(os.getenv("MOSS_PROJECT_ID"), os.getenv("MOSS_PROJECT_KEY"))
await client.create_index("faqs", documents, "moss-minilm")
await client.load_index("faqs")
results = await client.query("faqs", "How do I return a damaged product?", QueryOptions(top_k=3, alpha=0.6))
# results.docs[0].id / .text / .score
```
## Browser
```ts
import { MossClient } from "@moss-dev/moss-web";
const client = new MossClient("your-project-id", "your-project-key");
await client.createIndex("knowledge-base", [{ id: "1", text: "Machine learning fundamentals" }]);
await client.loadIndex("knowledge-base");
const results = await client.query("knowledge-base", "AI and neural networks");
```
Other methods (exact signatures UNCONFIRMED, see docs/reference/js/classes/MossClient.md): createIndexFromFiles (PDF/DOCX), add/update/delete docs (async server-side jobs, polled), getIndex/listIndexes/deleteIndex, multi-index query, auto-refresh, session() (Node only), metadata filtering.

## Hybrid search
`alpha` in query options: 1.0 = pure semantic, 0.0 = pure keyword (BM25), default 0.8. Lower for SKUs/exact identifiers.

## Latency claims
Sub-10ms retrieval; ~1-10ms in-memory queries after loadIndex; homepage benchmark (100K docs): Moss p50 3.1ms/p99 5.4ms vs Pinecone 432.6/934.2, Qdrant 597.6/771.4, Chroma 351.8/538.5; "32x faster than cloud RAG". Vendor claims, benchmarks at github.com/usemoss/moss/tree/main/benchmarks.

## Runtime
Browser (WASM) yes; Node yes (server); on-device Swift/C. Index is built/stored in Moss cloud, then loaded locally for queries (so "local" querying, cloud-backed storage/creation; createIndex needs network + credentials). Pricing: Developer free ($5 credits, 500MB), Hobbyist $30, Startup $200.

## URLs used
https://moss.dev, https://docs.moss.dev/docs, /docs/start/quickstart.md, /docs/reference/browser/{api,browser-vs-node}.md, /docs/reference/js/classes/MossClient.md, /docs/integrate/hybrid-search.md, /docs/pricing.md, https://github.com/usemoss
