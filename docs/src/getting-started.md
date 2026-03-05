# Getting Started

This page walks through the three things you'll do most: compress a file, estimate savings on a batch, and use fast mode.

## Compress a Single File

```bash
laconic compress README.md
```

Compressed text goes to **stdout**. Stats go to **stderr**:

```text
# README.md: 1648 → 1418 tokens (saved 230, 14.0%)
```

This means you can pipe the output cleanly:

```bash
laconic compress README.md > compressed.md
laconic compress README.md | pbcopy        # macOS clipboard
laconic compress README.md | xclip         # Linux clipboard
```

## Compress from Stdin

Use `-` to read from stdin:

```bash
cat README.md | laconic compress -
curl -s https://raw.githubusercontent.com/.../README.md | laconic compress -
```

## Estimate Savings (Without Compressing)

Want to know how much you'd save without producing output?

```bash
laconic estimate docs/*.md
```

```text
docs/api.md: 3044 → 2446 tokens (saved 598, 19.6%)
docs/guide.md: 1572 → 1572 tokens (saved 0, 0.0%)
TOTAL: 4616 → 4018 tokens (saved 598, 12.9%)
```

## Fast Mode

If you only need the compressed text and don't care about token statistics, use `--fast` (or `-f`):

```bash
laconic compress -f README.md
```

This skips the BPE tokenizer entirely, making compression near-instant even on large batches.

## JSON Output

Add `--json` (or `-j`) for machine-readable output:

```bash
laconic compress -j README.md
```

```json
{
  "file": "README.md",
  "original_tokens": 1648,
  "compressed_tokens": 1418,
  "tokens_saved": 230,
  "savings_pct": 13.96,
  "text": "# FastAPI Authentication Middleware\n..."
}
```

## Batch Processing

Compress every markdown file in a directory:

```bash
for f in docs/*.md; do
  laconic compress -f "$f" > "compressed/$(basename "$f")"
done
```

Or estimate savings across an entire corpus:

```bash
laconic estimate docs/**/*.md
```

## What to Expect

| Document type | Typical savings |
| --- | --- |
| HTML-heavy component docs | 40–55% |
| Awesome-lists (links, badges) | 20–30% |
| Table-heavy documentation | 15–25% |
| READMEs (badges, tables, code) | 10–15% |
| Pure prose | 0% |

Savings depend on how much decorative structure the document contains. Pure prose gets 0% savings — and that's correct. Laconic never modifies semantic content.
