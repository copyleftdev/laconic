# Compression Strategies

Laconic applies eight independent strategies. Each targets a specific type of markdown structure that costs tokens but carries no semantic value.

## Whitespace Normalization

**Always on.** Cannot be disabled.

- Strips trailing spaces from every line
- Collapses three or more consecutive blank lines down to two

This is the lowest-impact strategy but applies universally.

## Table Compaction

**On by default.** Disable with `--no-tables`.

Converts markdown pipe tables to compact CSV:

**Before:**

```markdown
| Name   | Role       | Status  |
|--------|------------|---------|
| Alice  | Engineer   | Active  |
| Bob    | Designer   | On Leave|
```

**After:**

```text
Name,Role,Status
Alice,Engineer,Active
Bob,Designer,On Leave
```

The separator row is removed entirely. Padding spaces inside cells are trimmed.

**Tradeoff:** Column alignment is lost. LLMs parse CSV natively, but the output is less human-readable. Use `--no-tables` when human readability of the compressed output matters.

## HTML Table Conversion

**On by default.** Disable with `--no-html`.

Converts `<table>` HTML to the same compact CSV format:

**Before:**

```html
<table>
  <tr><th>Name</th><th>Value</th></tr>
  <tr><td>timeout</td><td>30s</td></tr>
</table>
```

**After:**

```text
Name,Value
timeout,30s
```

## HTML Cleanup

**On by default.** Disable with `--no-html`.

Removes decorative HTML that carries no semantic weight:

- Strips `style="..."` attributes
- Strips `align="..."` attributes
- Unwraps `<div>` and `</div>` tags (keeps inner content)

Does **not** touch `<code>`, `<pre>`, `<a>`, or any semantic HTML.

## Badge Stripping

**On by default.** Disable with `--no-badges`.

Removes shield.io / badge images that are purely visual:

**Before:**

```markdown
[![Build Status](https://img.shields.io/github/actions/workflow/status/user/repo/ci.yml)](...)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](...)
```

**After:**

*(empty — both lines removed)*

Badges are meaningful to humans scanning a GitHub page but carry zero information for an LLM processing the document's content.

## Heading Normalization

**Always on.**

Strips trailing `#` characters from ATX headings:

**Before:**

```markdown
## Configuration ##
### Options ###
```

**After:**

```markdown
## Configuration
### Options
```

Minimal savings, but consistent normalization.

## Code Fence Compaction

**Always on.**

Removes common leading indentation from code blocks without changing the code's meaning:

**Before:**

````markdown
```python
    def hello():
        print("world")
```
````

**After:**

````markdown
```python
def hello():
    print("world")
```
````

The relative indentation is preserved. Only the common prefix is removed.

## URL Deduplication

**Off by default.** Enable with `--url-dedup`.

Converts repeated or long inline URLs to reference-style links:

**Before:**

```markdown
See [the docs](https://example.com/very/long/path/to/documentation).
Also check [the API](https://example.com/very/long/path/to/documentation).
```

**After:**

```markdown
See [the docs][1].
Also check [the API][1].

[1]: https://example.com/very/long/path/to/documentation
```

This is off by default because it changes the link style, which some workflows may not want. Enable it when you have documents with many repeated URLs.

## Strategy Selection Guide

| Scenario | Recommended flags |
| --- | --- |
| Maximum compression | (defaults — all on) + `--url-dedup` |
| Preserve table formatting | `--no-tables` |
| Keep HTML structure intact | `--no-html` |
| Conservative (whitespace + headings only) | `--no-tables --no-html --no-badges` |
| Speed over stats | `-f` (fast mode) |
