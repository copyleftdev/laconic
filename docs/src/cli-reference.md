# CLI Reference

## `laconic compress`

Compress one or more markdown files and output the result.

```bash
laconic compress [OPTIONS] <FILES>...
```

### Arguments

| Argument | Description |
| --- | --- |
| `<FILES>...` | One or more file paths. Use `-` for stdin. |

### Options

| Flag | Short | Description |
| --- | --- | --- |
| `--json` | `-j` | Output as JSON (includes token counts and savings) |
| `--fast` | `-f` | Skip token counting (faster, no stats in text mode) |
| `--no-tables` | | Disable markdown table compaction |
| `--no-html` | | Disable HTML table conversion and HTML cleanup |
| `--no-badges` | | Disable badge/shield image stripping |
| `--url-dedup` | | Enable URL deduplication (off by default) |

### Output Behavior

- **Compressed text** goes to **stdout**
- **Statistics** go to **stderr**
- Exit code `0` on success, `1` on error

This means you can pipe cleanly:

```bash
laconic compress input.md > output.md       # redirect text
laconic compress input.md 2>/dev/null       # suppress stats
laconic compress input.md 2>stats.txt       # capture stats separately
```

### Examples

```bash
# Basic compression
laconic compress README.md

# Fast mode, no token counting
laconic compress -f README.md

# JSON output for scripting
laconic compress -j README.md | jq '.tokens_saved'

# Stdin
cat README.md | laconic compress -

# Preserve tables, skip HTML cleanup
laconic compress --no-tables --no-html README.md

# Multiple files
laconic compress docs/*.md
```

---

## `laconic estimate`

Estimate token savings without producing compressed output.

```bash
laconic estimate [OPTIONS] <FILES>...
```

### Arguments

| Argument | Description |
| --- | --- |
| `<FILES>...` | One or more file paths. Use `-` for stdin. |

### Options

| Flag | Short | Description |
| --- | --- | --- |
| `--json` | `-j` | Output as JSON |

### Output

Per-file stats go to **stdout**. When processing multiple files, a `TOTAL` summary goes to **stderr**.

```bash
laconic estimate docs/*.md
```

```text
docs/api.md: 3044 → 2446 tokens (saved 598, 19.6%)
docs/guide.md: 1572 → 1572 tokens (saved 0, 0.0%)
TOTAL: 4616 → 4018 tokens (saved 598, 12.9%)
```

---

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `LACONIC_TELEMETRY` | `1` | Set to `0` to disable anonymous usage telemetry |

---

## POSIX Compliance

Laconic follows POSIX utility conventions:

- `-` reads from stdin
- `--` ends option parsing
- Short flags: `-j`, `-f`
- stdout for data, stderr for diagnostics
- Exit 0 on success, >0 on failure
- SIGPIPE handled correctly (piping to `head`/`tail` works)
- Output always ends with a newline
