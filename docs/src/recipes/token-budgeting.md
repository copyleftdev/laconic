# Token Budgeting

When you have a fixed context window (e.g., 128K tokens), every token matters. Laconic helps you fit more documents into the same budget without lossy truncation.

## The Math

Say you're building a prompt with retrieved context:

- System prompt: 2,000 tokens
- User query: 500 tokens
- Available for context: 125,500 tokens
- Retrieved docs: 150,000 tokens — **doesn't fit**

Option A: Truncate. Lose information.

Option B: Compress with Laconic. If your docs are structure-heavy (tables, HTML, badges), you recover 15–50% of that space.

## Budget-Aware Pipeline

```bash
#!/bin/bash
BUDGET=125000
USED=0

for doc in retrieved_docs/*.md; do
  # Get token count of compressed version
  stats=$(laconic compress -j "$doc" 2>/dev/null)
  tokens=$(echo "$stats" | jq '.compressed_tokens')
  
  NEXT=$((USED + tokens))
  if [ "$NEXT" -gt "$BUDGET" ]; then
    echo "Budget full at $USED tokens. Skipping remaining docs." >&2
    break
  fi
  
  # Output compressed text
  echo "$stats" | jq -r '.text'
  echo "---"
  USED=$NEXT
done
```

## Python Example

```python
import subprocess
import json

def compress_and_budget(docs: list[str], budget: int) -> str:
    context_parts = []
    used = 0

    for doc in docs:
        result = subprocess.run(
            ["laconic", "compress", "-j", "-"],
            input=doc, capture_output=True, text=True,
        )
        data = json.loads(result.stdout)
        tokens = data["compressed_tokens"]

        if used + tokens > budget:
            break

        context_parts.append(data["text"])
        used += tokens

    return "\n---\n".join(context_parts)
```

## Fast Mode for Large Batches

If you're processing hundreds of docs and just need the compressed text (not token counts), use fast mode to skip the BPE tokenizer entirely:

```bash
# Compress 500 docs in under a second
for doc in corpus/*.md; do
  laconic compress -f "$doc" > "compressed/$(basename "$doc")"
done
```

You can then count tokens separately on just the winners, or use your LLM provider's tokenizer.

## Stacking with Other Optimizations

Laconic compresses the **structure**. You can stack it with other techniques:

| Technique | What it removes | Typical savings |
| --- | --- | --- |
| **Laconic** | Decorative markdown structure | 15–50% on structured docs |
| **Prompt caching** | Repeated prefix tokens | Up to 90% cost reduction |
| **Batch API** | Nothing — just cheaper pricing | 50% cost reduction |

These are multiplicative. Laconic + prompt caching + batch API can reduce effective cost by 95%+ on structure-heavy workloads.
