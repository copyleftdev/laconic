# Laconic

**Maximum meaning, minimum tokens.**

Laconic compresses markdown documents for LLM workflows by applying lossless syntactic transformations. It strips decorative noise — badge images, padded tables, HTML wrappers, redundant whitespace — that costs tokens but carries no semantic value.

Named after the Spartans of Laconia, famous for expressing maximum meaning with minimum words. When Philip II of Macedon threatened *"If I invade Laconia, I will raze Sparta,"* the Spartans replied: ***"If."***

## What It Does

Laconic removes structure that LLMs don't need to understand your document:

| Before | After | Why |
| --- | --- | --- |
| `[![Build](https://img.shields.io/...)](...)` | *(removed)* | Badges are visual, not semantic |
| `\| Col1 \| Col2 \|` with separator rows | `Col1,Col2` | CSV is more token-efficient |
| `<div style="padding: 20px">content</div>` | `content` | Decorative HTML wrappers |
| Three blank lines | One blank line | Whitespace normalization |
| Repeated inline URLs | Reference-style links | URL deduplication |

## What It Never Touches

- Prose text
- Code blocks (contents preserved exactly)
- Headings (structure preserved)
- Lists
- Anything that carries meaning

## Three Ways to Use It

1. **CLI** — `laconic compress README.md`
2. **Rust library** — `laconic_core::compress(&text, &config)`
3. **MCP server** — Agents call `compress_markdown` as a tool

Pick the one that fits your workflow. The next pages walk through each.
