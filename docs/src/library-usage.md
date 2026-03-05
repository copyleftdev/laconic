# Library Usage

Add `laconic-core` to your Rust project:

```bash
cargo add laconic-core
```

## Basic Compression

```rust
use laconic_core::{compress, CompressConfig};

let input = std::fs::read_to_string("README.md").unwrap();
let config = CompressConfig::default();
let result = compress(&input, &config);

println!("Saved {} tokens ({:.1}%)", result.tokens_saved, result.savings_pct);
println!("{}", result.text);
```

## Fast Path (No Token Counting)

When you only need the compressed text and don't need statistics:

```rust
use laconic_core::{compress_text, CompressConfig};

let input = std::fs::read_to_string("README.md").unwrap();
let config = CompressConfig::default();
let compressed = compress_text(&input, &config);

// `compressed` is a String — no token counting overhead
```

This is significantly faster for batch processing where you don't need per-file token stats.

## Streaming

Process large files without loading everything into a string first:

```rust
use laconic_core::{compress_reader, CompressConfig};
use std::io;

let config = CompressConfig::default();
compress_reader(io::stdin(), io::stdout(), &config).unwrap();
```

## Custom Configuration

Toggle individual strategies on or off:

```rust
use laconic_core::CompressConfig;

let config = CompressConfig {
    tables: false,          // preserve markdown tables
    html_tables: true,      // convert HTML tables to CSV
    html_cleanup: true,     // strip decorative HTML
    badges: true,           // remove badge images
    url_dedup: true,        // deduplicate URLs (off by default)
    skip_token_count: true, // skip BPE tokenizer (fast mode)
    ..CompressConfig::default()
};
```

## The `CompressResult` Struct

```rust
pub struct CompressResult {
    pub text: String,           // compressed markdown
    pub original_tokens: usize, // token count before (0 if skip_token_count)
    pub compressed_tokens: usize,
    pub tokens_saved: usize,
    pub savings_pct: f64,       // 0.0–100.0
}
```

## Guarantees

These hold for all inputs:

- **Idempotent:** `compress(compress(x)) == compress(x)`
- **Never inflates:** `result.compressed_tokens <= result.original_tokens`
- **No panics:** Tested across hundreds of real-world markdown files
- **Deterministic:** Same input + config always produces the same output
