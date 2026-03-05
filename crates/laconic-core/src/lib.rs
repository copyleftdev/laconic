//! # Laconic Core
//!
//! Maximum meaning, minimum tokens.
//!
//! Provides markdown compression strategies for reducing LLM token usage
//! while preserving semantic content. Strategies are composable and each
//! can be applied independently or chained.

pub mod strategies;
pub mod tokens;

use std::io;

use serde::{Deserialize, Serialize};

/// Configuration for the compression pipeline.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressConfig {
    /// Enable whitespace normalization.
    pub whitespace: bool,
    /// Enable markdown table → compact CSV conversion.
    pub tables: bool,
    /// Enable HTML table → compact CSV conversion.
    pub html_tables: bool,
    /// Enable decorative HTML stripping (divs, style attrs).
    pub html_cleanup: bool,
    /// Enable badge/shield image removal.
    pub badges: bool,
    /// Enable heading normalization.
    pub headings: bool,
    /// Enable code fence compaction.
    pub code_fences: bool,
    /// Enable URL reference-link deduplication.
    pub url_dedup: bool,
    /// Skip token counting (faster when only text output is needed).
    pub skip_token_count: bool,
}

impl Default for CompressConfig {
    fn default() -> Self {
        Self {
            whitespace: true,
            tables: true,
            html_tables: true,
            html_cleanup: true,
            badges: true,
            headings: true,
            code_fences: true,
            url_dedup: false, // off by default — can increase tokens on typical docs
            skip_token_count: false,
        }
    }
}

/// Result of a compression operation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressResult {
    /// The compressed markdown text.
    pub text: String,
    /// Original token count (cl100k_base).
    pub original_tokens: usize,
    /// Compressed token count.
    pub compressed_tokens: usize,
    /// Tokens saved.
    pub tokens_saved: usize,
    /// Percentage saved.
    pub savings_pct: f64,
}

/// Compress markdown text only — no token counting.
///
/// Use this when you only need the compressed output and don't
/// need statistics. Avoids the BPE tokenization overhead entirely.
pub fn compress_text(input: &str, config: &CompressConfig) -> String {
    apply_strategies(input, config)
}

/// Compress from a reader, write to a writer.
///
/// Reads the entire input into memory, compresses, and writes.
/// For markdown documents (typically < 1MB) this is efficient.
pub fn compress_reader(
    reader: &mut dyn io::Read,
    writer: &mut dyn io::Write,
    config: &CompressConfig,
) -> io::Result<()> {
    let mut input = String::new();
    reader.read_to_string(&mut input)?;
    let output = apply_strategies(&input, config);
    writer.write_all(output.as_bytes())?;
    Ok(())
}

/// Compress markdown using the configured strategies.
///
/// Applies each enabled strategy in sequence. The order is chosen to
/// maximize composability: structural transforms first, then cleanup.
pub fn compress(input: &str, config: &CompressConfig) -> CompressResult {
    let text = apply_strategies(input, config);

    if config.skip_token_count {
        return CompressResult {
            text,
            original_tokens: 0,
            compressed_tokens: 0,
            tokens_saved: 0,
            savings_pct: 0.0,
        };
    }

    let original_tokens = tokens::count(input);

    let compressed_tokens = tokens::count(&text);
    let tokens_saved = original_tokens.saturating_sub(compressed_tokens);
    let savings_pct = if original_tokens > 0 {
        (tokens_saved as f64 / original_tokens as f64) * 100.0
    } else {
        0.0
    };

    CompressResult {
        text,
        original_tokens,
        compressed_tokens,
        tokens_saved,
        savings_pct,
    }
}

/// Estimate token savings without returning the compressed text.
pub fn estimate(input: &str, config: &CompressConfig) -> CompressResult {
    compress(input, config)
}

/// Apply all configured strategies in sequence.
fn apply_strategies(input: &str, config: &CompressConfig) -> String {
    let mut text = input.to_string();

    if config.whitespace {
        text = strategies::whitespace::normalize(&text);
    }
    if config.badges {
        text = strategies::badges::strip(&text);
    }
    if config.html_tables {
        text = strategies::html_tables::compact(&text);
    }
    if config.html_cleanup {
        text = strategies::html_cleanup::strip_decorative(&text);
    }
    if config.tables {
        text = strategies::tables::compact(&text);
    }
    if config.url_dedup {
        text = strategies::urls::deduplicate(&text);
    }
    if config.code_fences {
        text = strategies::code_fences::compact(&text);
    }
    if config.headings {
        text = strategies::headings::normalize(&text);
    }
    if config.whitespace {
        text = strategies::whitespace::normalize(&text);
    }

    text
}
