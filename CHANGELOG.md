# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-04

### Added

- **laconic-core**: Compression library with 8 lossless strategies (whitespace, badges, html_tables, html_cleanup, tables, urls, code_fences, headings)
- **laconic-cli**: CLI binary with `compress` and `estimate` subcommands
- **laconic-mcp**: MCP server with `compress_markdown` and `estimate_savings` tools over stdio
- `compress()` — full compression with token statistics
- `compress_text()` — fast path, no token counting overhead
- `compress_reader()` — streaming `io::Read`/`io::Write` interface
- `CompressConfig` with per-strategy toggles and `skip_token_count` flag
- `--fast` / `-f` flag to skip BPE tokenizer
- `--json` / `-j` flag for machine-readable output
- `--no-tables`, `--no-html`, `--no-badges`, `--url-dedup` strategy toggles
- POSIX-compliant CLI (stdin via `-`, short flags, SIGPIPE handling, trailing newline)
- All regex patterns cached in `LazyLock<Regex>` statics
- Tokenizer cached in `LazyLock<CoreBPE>` static
- 23 unit tests covering all strategies
- mdBook documentation site deployed to GitHub Pages
