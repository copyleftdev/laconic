<div align="center">

<img src="assets/logo.svg" alt="Laconic" width="140">

# Laconic

**Cut your LLM token costs. Keep every word that matters.**

[![Rust](https://img.shields.io/badge/rust-stable-orange?logo=rust)](https://www.rust-lang.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-compatible-green?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDJMMyA3djEwbDkgNSA5LTVWN2wtOS01eiIvPjwvc3ZnPg==)](https://modelcontextprotocol.io)
[![Docs](https://img.shields.io/badge/docs-mdBook-informational)](https://copyleftdev.github.io/laconic/)

*Named after the Spartans of Laconia — when Philip II threatened "If I invade Laconia, I will raze Sparta," they replied: **"If."***

</div>

---

## The Problem

You're feeding markdown into GPT-4, Claude, or Gemini. But up to **50% of your tokens** are going to things the model doesn't need:

```markdown
[![Build Status](https://img.shields.io/github/actions/workflow/status/org/repo/ci.yml?branch=main&style=flat-square&logo=github)](https://github.com/org/repo/actions)
[![Coverage](https://img.shields.io/codecov/c/github/org/repo?style=flat-square&logo=codecov)](https://codecov.io/gh/org/repo)

<div style="padding: 20px; background: #f5f5f5; border-radius: 8px">
  <table border="1" cellpadding="8">
    <tr><th style="text-align:left">Config</th><th>Value</th></tr>
    <tr><td>timeout</td><td>30s</td></tr>
    <tr><td>retries</td><td>3</td></tr>
  </table>
</div>
```

That's **96 tokens** of badges, HTML wrappers, and table formatting. The LLM needs **9**:

```text
Config,Value
timeout,30s
retries,3
```

**Laconic does this automatically.** Zero config. Zero semantic loss. Sub-millisecond.

---

## Install

```bash
git clone https://github.com/copyleftdev/laconic.git
cd laconic
cargo build --release
cp target/release/laconic /usr/local/bin/
```

## Usage

```bash
# Compress a file
laconic compress README.md

# Fast mode (skip token counting)
laconic compress -f README.md

# Estimate savings across a directory
laconic estimate docs/**/*.md

# Pipe from stdin, JSON output
cat prompt.md | laconic compress -j -
```

Compressed text goes to **stdout**. Stats go to **stderr**. Pipes cleanly.

---

## Savings You Can Expect

| Document Type | Savings | Example |
| --- | --- | --- |
| HTML-heavy docs (React, Angular) | **40–55%** | Component libraries, Storybook exports |
| Awesome-lists | **20–30%** | Badge-heavy curated lists |
| API documentation | **15–25%** | Table-heavy references, OpenAPI rendered docs |
| READMEs | **10–15%** | Typical open-source project READMEs |
| Pure prose | **0%** | Blog posts, essays — Laconic never touches meaning |

---

## Three Ways to Use It

### CLI

```bash
laconic compress README.md                     # compress to stdout
laconic compress -f docs/*.md                  # fast, no token stats
laconic estimate --json docs/**/*.md           # audit token spend
```

### Rust Library

```rust
use laconic_core::{compress, compress_text, CompressConfig};

// Full stats
let result = compress(&markdown, &CompressConfig::default());
println!("Saved {} tokens ({:.1}%)", result.tokens_saved, result.savings_pct);

// Fast path — just the text, no token counting
let compressed = compress_text(&markdown, &CompressConfig::default());
```

### MCP Server (for AI Agents)

Any MCP-compatible client — Windsurf, Cursor, Claude Desktop — can call Laconic as a tool:

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

The agent gets two tools:

- **`compress_markdown`** — compress and return text + token stats
- **`estimate_savings`** — check if compression is worth it before committing

---

## How It Works

Eight lossless strategies, applied in sequence:

| Strategy | What It Removes | Toggle |
| --- | --- | --- |
| Whitespace | Extra blank lines, trailing spaces | Always on |
| Badges | Shield.io / badge images | `--no-badges` |
| HTML Tables | `<table>` blocks → CSV | `--no-html` |
| HTML Cleanup | `<div>`, `style=""`, `align=""` | `--no-html` |
| Markdown Tables | Pipe tables → CSV | `--no-tables` |
| Code Fences | Common leading indentation | Always on |
| Headings | Trailing `#` characters | Always on |
| URL Dedup | Repeated inline URLs → references | `--url-dedup` |

**Guarantees:**
- **Idempotent** — `compress(compress(x)) == compress(x)`
- **Never inflates** — output tokens ≤ input tokens, always
- **Deterministic** — same input always produces the same output
- **No panics** — tested across hundreds of real-world files

---

## Why Not LLMLingua-2?

| | Laconic | LLMLingua-2 |
| --- | --- | --- |
| **Type** | Lossless (syntactic) | Lossy (linguistic) |
| **Fidelity** | 100% | ~94% SBERT similarity |
| **Speed** | Sub-millisecond | 100ms–2s per doc |
| **Dependencies** | None (5.6MB binary) | Python + PyTorch + 300MB model |
| **Best for** | Structure-heavy docs | Prose compression |

**They stack.** Run Laconic first (fast, free), then LLMLingua-2 on the result.

---

## Documentation

Full user guide with recipes for RAG pipelines, CI/CD integration, and token budgeting:

**[copyleftdev.github.io/laconic](https://copyleftdev.github.io/laconic/)**

---

## License

MIT
