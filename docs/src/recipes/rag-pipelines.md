# RAG Pipelines

The primary use case for Laconic: compress retrieved documents before injecting them into an LLM's context window.

## The Problem

RAG pipelines retrieve markdown documents and stuff them into prompts. But markdown carries a lot of decorative weight:

- Badge images that mean nothing to an LLM
- Padded table formatting that wastes tokens
- HTML wrappers from CMS exports
- Redundant whitespace

Every wasted token is money spent and context window consumed.

## Basic Integration

```bash
# Compress all retrieved docs before feeding to the LLM
for doc in retrieved_docs/*.md; do
  laconic compress -f "$doc" > "context/$(basename "$doc")"
done
```

## Python Integration

Call the CLI from Python:

```python
import subprocess

def compress_markdown(text: str) -> str:
    result = subprocess.run(
        ["laconic", "compress", "-f", "-"],
        input=text,
        capture_output=True,
        text=True,
    )
    return result.stdout

# In your RAG pipeline
retrieved_doc = vector_store.query("How do I configure auth?")
compressed = compress_markdown(retrieved_doc.content)
prompt = f"Given this context:\n\n{compressed}\n\nAnswer the question..."
```

## With Token Stats

If you want to track savings:

```python
import subprocess
import json

def compress_with_stats(text: str) -> dict:
    result = subprocess.run(
        ["laconic", "compress", "-j", "-"],
        input=text,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)

stats = compress_with_stats(doc.content)
print(f"Saved {stats['tokens_saved']} tokens ({stats['savings_pct']}%)")
compressed_text = stats["text"]
```

## Rust Integration

If your pipeline is in Rust:

```rust
use laconic_core::{compress_text, CompressConfig};

fn prepare_context(docs: &[String]) -> String {
    let config = CompressConfig::default();
    docs.iter()
        .map(|doc| compress_text(doc, &config))
        .collect::<Vec<_>>()
        .join("\n---\n")
}
```

## Decision: When to Compress

Not every document benefits from compression. Use `estimate` to decide:

```bash
laconic estimate docs/*.md
```

If a document shows 0% savings (pure prose), skip it. Focus compression on structure-heavy documents where savings are 10%+.

The MCP server's `estimate_savings` tool lets agents make this decision autonomously.
