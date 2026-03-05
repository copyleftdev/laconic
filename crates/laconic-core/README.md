# Laconic

**Maximum meaning, minimum tokens.**

Laconic is a Rust-based markdown compression toolkit that reduces LLM token usage by applying lossless syntactic transformations to markdown documents. It ships as a library (`laconic-core`), a CLI (`laconic`), and a Model Context Protocol server (`laconic-mcp`) for direct integration into agentic AI workflows.

Named after the Spartans of Laconia — famous for expressing maximum meaning with minimum words. When Philip II of Macedon threatened "If I invade Laconia, I will raze Sparta," the Spartans replied: *"If."*

---

## Use Cases

### 1. Pre-processing documents before LLM context injection

The primary use case. When an agent or RAG pipeline retrieves markdown documents to stuff into an LLM's context window, Laconic compresses them first — stripping decorative noise that costs tokens but carries no semantic value.

```
Retriever → Laconic → LLM prompt
```

**Real-world impact:** On HTML-heavy documentation, savings exceed 50%. On table-heavy READMEs, 15–25%. On pure prose, 0% — Laconic never touches what matters.

### 2. Agentic tool via MCP

Laconic exposes itself as an MCP server over stdio. Any MCP-compatible client (Windsurf, Cursor, Claude Desktop, custom agents) can call it directly:

```json
{
  "mcpServers": {
    "laconic": {
      "command": "laconic-mcp",
      "args": []
    }
  }
}
```

An agent can call `estimate_savings` to decide if compression is worth it, then `compress_markdown` to do the work. The agent makes the economic decision; Laconic provides the data.

### 3. CI/CD documentation optimization

Run Laconic as a pre-processing step on documentation before it enters a vector store or knowledge base. Every document gets compressed once, every query benefits.

```bash
find docs/ -name "*.md" -exec laconic compress {} \; > compressed_docs/
```

### 4. Cost estimation and budgeting

Use `laconic estimate` to audit a corpus and understand how much of your token spend is going to decorative markdown structure (badge images, HTML wrappers, padded tables).

```bash
laconic estimate corpus/**/*.md
# TOTAL: 459350 → 455810 tokens (saved 3540, 0.8%)
```

### 5. Token-budget-constrained pipelines

When you have a hard token budget (e.g., 128K context window), Laconic lets you fit more documents into the same window without lossy truncation.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  laconic-core (library)                                 │
│                                                         │
│  Input ──→ [whitespace] ──→ [badges] ──→ [html_tables]  │
│        ──→ [html_cleanup] ──→ [tables] ──→ [urls]       │
│        ──→ [code_fences] ──→ [headings] ──→ [whitespace]│
│        ──→ token count ──→ CompressResult               │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
       ┌───────▼───────┐      ┌───────▼───────┐
       │  laconic-cli   │      │  laconic-mcp  │
       │  (binary)      │      │  (MCP server) │
       │                │      │               │
       │  compress      │      │  stdio JSON-  │
       │  estimate      │      │  RPC transport│
       └───────┬───────┘      └───────┬───────┘
               │                      │
           Files / stdin          AI agents
```

### Compression Strategies (applied in order)

| Strategy | What it does | Token impact |
|---|---|---|
| **whitespace** | Collapse 3+ blank lines, strip trailing spaces | Small but universal |
| **badges** | Remove shield.io badge images, preserve link text | High on READMEs |
| **html_tables** | Convert `<table>` blocks to compact CSV | Very high on docs |
| **html_cleanup** | Strip decorative `<div>`, `style=""` attributes | High on rich docs |
| **tables** | Convert markdown tables to `[Header,Header]\nval,val` CSV | High on data-heavy docs |
| **urls** | Deduplicate repeated/long inline links to reference-style | Off by default |
| **code_fences** | Remove common leading indentation from code blocks | Small |
| **headings** | Normalize ATX headings, strip trailing `#` characters | Small |

All strategies are **lossless on semantic content**. They remove presentation, not meaning.

---

## Quick Start

### CLI

```bash
# Build
cargo build --release

# Compress a file (output to stdout, stats to stderr)
laconic compress README.md

# Estimate savings across a directory
laconic estimate docs/*.md

# Pipe from stdin
cat prompt.md | laconic compress -

# JSON output with full stats
laconic compress --json README.md
```

### As a Rust library

```rust
use laconic_core::{compress, CompressConfig};

let config = CompressConfig::default();
let result = compress(&markdown_text, &config);

println!("Saved {} tokens ({:.1}%)", result.tokens_saved, result.savings_pct);
println!("{}", result.text);
```

### As an MCP server

```bash
# Start the server (agents connect over stdio)
laconic-mcp
```

Agents call two tools:

- **`compress_markdown`** — Takes `markdown` string, returns compressed text + token stats.
- **`estimate_savings`** — Takes `markdown` string, returns token stats + recommendation without the compressed text.

---

## Measured Results

Tested against 391 files from Daniel Miessler's [fabric](https://github.com/danielmiessler/fabric) markdown corpus and 5 diverse synthetic samples:

### Synthetic samples (structure-heavy)

| Document type | Original | Compressed | Savings |
|---|---|---|---|
| README (badges, tables, code) | 1,648 tok | 1,418 tok | **14.0%** |
| Table-heavy documentation | 3,044 tok | 2,446 tok | **19.6%** |
| Pure prose | 1,572 tok | 1,572 tok | **0.0%** |
| Awesome-list (links, badges) | 2,515 tok | 1,857 tok | **26.2%** |
| HTML-heavy component docs | 2,306 tok | 1,070 tok | **53.6%** |

### Fabric corpus (391 real-world files)

| Metric | Value |
|---|---|
| Files processed | 391 |
| Files with savings | 164 (42%) |
| Total tokens | 459,350 → 455,810 |
| Aggregate savings | 0.77% |
| Max single-file savings | 100% |

The 0.77% aggregate on fabric is expected — fabric is predominantly prose-heavy prompt templates. Laconic's syntactic strategies target **structure**, not prose. On structure-heavy documentation (the actual use case for RAG context injection), savings are 15–50%.

---

## Pros

1. **Zero semantic loss.** Every transformation is lossless on meaning. Headings, code, lists, and prose are never modified. Only decorative structure (table pipes, HTML wrappers, badge images) is compressed.

2. **No model required.** Unlike LLMLingua-2 or other linguistic compression methods, Laconic runs pure deterministic regex + AST transforms. No ONNX model, no GPU, no Python, no 300MB model download. The release binary is 5.6MB.

3. **Idempotent.** `compress(compress(x)) == compress(x)` — proven across 391 files. No oscillation, no artifacts accumulating across passes.

4. **Never inflates.** Proven across the entire fabric corpus: compressed output is always ≤ original token count. The worst case is 0% savings (pure prose), never negative savings.

5. **Fast.** The compression itself is sub-millisecond per document. The bottleneck is token counting (BPE encoding), not the transforms.

6. **Composable.** Each strategy can be toggled independently (`--no-tables`, `--no-html`, `--no-badges`, `--url-dedup`). Use only what makes sense for your corpus.

7. **MCP-native.** First-class agentic integration — agents can call compression as a tool, making the decision to compress part of their workflow rather than a hardcoded pipeline step.

8. **Single static binary.** No runtime dependencies. Deploy by copying a file.

---

## Cons

1. **Syntactic only.** Laconic does not do linguistic compression. It cannot rephrase "The function returns a boolean value indicating whether or not the operation succeeded" into "Returns bool for success." For that, you need a model-based approach like LLMLingua-2. The architecture supports a future `linguistic` feature flag via ONNX Runtime — the interface is ready, the model integration is not yet wired.

2. **Low impact on prose-heavy documents.** If your corpus is mostly narrative text with minimal tables, HTML, or badges, Laconic will show near-zero savings. Direct consequence of #1 — solvable when linguistic compression is added.

3. ~~**Token counting is slow.**~~ **ELIMINATED.** Tokenizer is cached in a `LazyLock<CoreBPE>` — initialized once, reused across all calls. All regex patterns are similarly cached. Result: **391 files in 0.53s** with token counting, **46ms** without (`--fast` / `compress_text()`). Use `skip_token_count: true` or `compress_text()` when you only need the output.

4. **CSV conversion is lossy on alignment.** Converting `| Col | Col |` to `Col,Col` loses column alignment information. LLMs handle this fine (they parse CSV natively), but the output is less human-readable. Use `--no-tables` to preserve table formatting when human readability matters.

5. ~~**No streaming.**~~ **ELIMINATED.** `compress_reader()` accepts `io::Read` + `io::Write` for pipeline integration. `compress_text()` returns text directly without statistics overhead. Both avoid unnecessary allocations.

6. **Regex-based HTML parsing.** The HTML strategies use cached `LazyLock<Regex>` patterns rather than a DOM parser. This handles 95%+ of real-world markdown HTML and has been validated across 391 fabric corpus files with zero failures. A future `comrak`-AST-based approach could replace this for edge-case correctness, but the current implementation has no known failures.

---

## When to Use Laconic vs. LLMLingua-2

| | Laconic | LLMLingua-2 |
|---|---|---|
| **Approach** | Syntactic (deterministic transforms) | Linguistic (ML token pruning) |
| **Savings on structure-heavy docs** | 15–53% | 20% (at 80% keep) |
| **Savings on prose** | 0% | 20% |
| **Semantic fidelity** | 100% (lossless) | ~94% SBERT similarity |
| **Runtime dependency** | None (static binary) | Python + PyTorch + 300MB model |
| **Latency** | Sub-millisecond | 100ms–2s per document |
| **Best for** | RAG pipelines, documentation, READMEs | General prompt compression, prose |

**They stack.** Run Laconic first (fast, lossless), then LLMLingua-2 on the result if you need deeper compression. Our benchmarks showed the combined approach yields ~21.5% savings with 0.938 SBERT similarity.

---

## Testing

```bash
# Unit tests (23 tests, all strategies)
cargo test -p laconic-core

# Integration tests against fabric corpus (391 files, 6 invariants)
cargo test --test fabric_corpus -- --nocapture

# Tested invariants:
# 1. No panics on any input
# 2. No token inflation (compressed ≤ original, always)
# 3. Idempotent (compress twice == compress once)
# 4. Structural integrity (headings, code fences survive)
# 5. Aggregate savings within expected bounds
# 6. Edge cases (empty, tiny, unicode inputs)
```

---

## Project Structure

```
crates/
  laconic-core/       # Compression library
    src/
      lib.rs          # Public API: compress(), estimate(), CompressConfig
      tokens.rs       # Token counting (tiktoken cl100k_base)
      strategies/     # 8 compression strategies
        whitespace.rs
        tables.rs
        html_tables.rs
        html_cleanup.rs
        badges.rs
        headings.rs
        code_fences.rs
        urls.rs
    tests/
      fabric_corpus.rs  # Integration tests against 391-file corpus

  laconic-cli/        # CLI binary
    src/main.rs       # compress, estimate subcommands

  laconic-mcp/        # MCP server binary
    src/main.rs       # stdio transport, compress_markdown + estimate_savings tools
```

---

## License

MIT
