# CI/CD Integration

Compress documentation at build time so every downstream consumer benefits automatically.

## GitHub Actions

Add a step to your workflow that compresses docs before they enter a vector store or knowledge base:

```yaml
- name: Compress docs for vector store
  run: |
    cargo install --path crates/laconic-cli
    mkdir -p compressed_docs
    for f in docs/*.md; do
      laconic compress -f "$f" > "compressed_docs/$(basename "$f")"
    done

- name: Upload to vector store
  run: ./scripts/upload_to_pinecone.sh compressed_docs/
```

## Pre-commit Hook

Compress docs automatically on every commit:

```bash
#!/bin/sh
# .git/hooks/pre-commit

for f in $(git diff --cached --name-only --diff-filter=ACM -- '*.md'); do
  laconic compress -f "$f" > "${f%.md}.compressed.md"
  git add "${f%.md}.compressed.md"
done
```

## Audit Token Spend

Add a CI step that reports token savings across your doc corpus:

```yaml
- name: Token audit
  run: |
    laconic estimate docs/**/*.md 2>&1 | tee token-audit.txt
    # Fail if any file shows negative savings (should never happen)
    if grep -q "saved -" token-audit.txt; then
      echo "ERROR: Token inflation detected"
      exit 1
    fi
```

## Docker

Laconic is a single static binary. No runtime dependencies:

```dockerfile
FROM rust:1.75 AS builder
WORKDIR /build
COPY . .
RUN cargo build --release --bin laconic

FROM debian:bookworm-slim
COPY --from=builder /build/target/release/laconic /usr/local/bin/
ENTRYPOINT ["laconic"]
```

```bash
docker build -t laconic .
docker run --rm -i laconic compress - < README.md
```
