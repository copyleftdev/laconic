//! # Laconic CLI
//!
//! Maximum meaning, minimum tokens.
//!
//! ```text
//! laconic compress README.md
//! laconic estimate --json docs/*.md
//! cat input.md | laconic compress -
//! ```

use std::io::{self, Read};
use std::path::PathBuf;

use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use laconic_core::{compress, estimate, CompressConfig, CompressResult};

/// Reset SIGPIPE to default so piping to head/tail/etc. doesn't panic.
#[cfg(unix)]
fn reset_sigpipe() {
    // SIGPIPE = 13 on all POSIX platforms, SIG_DFL = 0
    unsafe {
        libc_signal(13, 0);
    }
}

#[cfg(unix)]
extern "C" {
    #[link_name = "signal"]
    fn libc_signal(sig: i32, handler: usize) -> usize;
}

#[derive(Parser)]
#[command(
    name = "laconic",
    about = "Maximum meaning, minimum tokens. Markdown compression for LLM workflows.",
    version,
    after_help = "Examples:\n  laconic compress README.md\n  laconic estimate docs/*.md\n  cat prompt.md | laconic compress -"
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Compress markdown and output the result.
    Compress {
        /// Input file(s). Use `-` for stdin.
        #[arg(required = true)]
        files: Vec<PathBuf>,

        /// Output as JSON (includes token counts and savings).
        #[arg(short, long)]
        json: bool,

        /// Disable table compaction.
        #[arg(long)]
        no_tables: bool,

        /// Disable HTML cleanup.
        #[arg(long)]
        no_html: bool,

        /// Disable badge stripping.
        #[arg(long)]
        no_badges: bool,

        /// Enable URL deduplication (off by default).
        #[arg(long)]
        url_dedup: bool,

        /// Skip token counting (faster, no stats in non-JSON mode).
        #[arg(short, long)]
        fast: bool,
    },

    /// Estimate token savings without outputting compressed text.
    Estimate {
        /// Input file(s). Use `-` for stdin.
        #[arg(required = true)]
        files: Vec<PathBuf>,

        /// Output as JSON.
        #[arg(short, long)]
        json: bool,
    },
}

fn read_input(path: &PathBuf) -> Result<(String, String)> {
    if path.as_os_str() == "-" {
        let mut buf = String::new();
        io::stdin()
            .read_to_string(&mut buf)
            .context("reading stdin")?;
        Ok(("stdin".to_string(), buf))
    } else {
        let content =
            std::fs::read_to_string(path).with_context(|| format!("reading {}", path.display()))?;
        Ok((path.display().to_string(), content))
    }
}

fn build_config(
    no_tables: bool,
    no_html: bool,
    no_badges: bool,
    url_dedup: bool,
    fast: bool,
) -> CompressConfig {
    CompressConfig {
        tables: !no_tables,
        html_tables: !no_html,
        html_cleanup: !no_html,
        badges: !no_badges,
        url_dedup,
        skip_token_count: fast,
        ..CompressConfig::default()
    }
}

fn print_result_text(name: &str, result: &CompressResult) {
    eprintln!(
        "# {name}: {orig} → {comp} tokens (saved {saved}, {pct:.1}%)",
        orig = result.original_tokens,
        comp = result.compressed_tokens,
        saved = result.tokens_saved,
        pct = result.savings_pct,
    );
    print!("{}", result.text);
    if !result.text.ends_with('\n') {
        println!();
    }
}

fn print_result_json(name: &str, result: &CompressResult) {
    let obj = serde_json::json!({
        "file": name,
        "original_tokens": result.original_tokens,
        "compressed_tokens": result.compressed_tokens,
        "tokens_saved": result.tokens_saved,
        "savings_pct": (result.savings_pct * 100.0).round() / 100.0,
        "text": result.text,
    });
    println!("{}", serde_json::to_string_pretty(&obj).expect("json serialize"));
}

fn print_estimate_text(name: &str, result: &CompressResult) {
    println!(
        "{name}: {orig} → {comp} tokens (saved {saved}, {pct:.1}%)",
        orig = result.original_tokens,
        comp = result.compressed_tokens,
        saved = result.tokens_saved,
        pct = result.savings_pct,
    );
}

fn print_estimate_json(name: &str, result: &CompressResult) {
    let obj = serde_json::json!({
        "file": name,
        "original_tokens": result.original_tokens,
        "compressed_tokens": result.compressed_tokens,
        "tokens_saved": result.tokens_saved,
        "savings_pct": (result.savings_pct * 100.0).round() / 100.0,
    });
    println!("{}", serde_json::to_string_pretty(&obj).expect("json serialize"));
}

fn main() -> Result<()> {
    #[cfg(unix)]
    reset_sigpipe();

    let cli = Cli::parse();

    match cli.command {
        Commands::Compress {
            files,
            json,
            no_tables,
            no_html,
            no_badges,
            url_dedup,
            fast,
        } => {
            let config = build_config(no_tables, no_html, no_badges, url_dedup, fast);
            for path in &files {
                let (name, content) = read_input(path)?;
                let result = compress(&content, &config);
                if json {
                    print_result_json(&name, &result);
                } else {
                    print_result_text(&name, &result);
                }
            }
        }
        Commands::Estimate { files, json } => {
            let config = CompressConfig::default();
            let mut total_orig = 0usize;
            let mut total_comp = 0usize;

            for path in &files {
                let (name, content) = read_input(path)?;
                let result = estimate(&content, &config);
                total_orig += result.original_tokens;
                total_comp += result.compressed_tokens;

                if json {
                    print_estimate_json(&name, &result);
                } else {
                    print_estimate_text(&name, &result);
                }
            }

            if files.len() > 1 {
                let saved = total_orig.saturating_sub(total_comp);
                let pct = if total_orig > 0 {
                    (saved as f64 / total_orig as f64) * 100.0
                } else {
                    0.0
                };
                eprintln!(
                    "TOTAL: {total_orig} → {total_comp} tokens (saved {saved}, {pct:.1}%)"
                );
            }
        }
    }

    Ok(())
}
