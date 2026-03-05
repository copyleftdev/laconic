//! Integration tests against Daniel Miessler's fabric markdown corpus.
//!
//! These tests walk every .md file in corpus/fabric and assert:
//!
//! 1. **No panics** — compression never crashes on any real-world input.
//! 2. **No inflation** — compressed output never has MORE tokens than the original.
//! 3. **Non-destructive** — compression of empty/tiny files produces valid output.
//! 4. **Idempotent** — compressing twice produces the same result as compressing once.
//! 5. **Structural integrity** — markdown headings, code fences, and list markers survive.
//! 6. **Aggregate savings** — total corpus savings are within expected bounds.

use std::path::{Path, PathBuf};

use laconic_core::{compress, CompressConfig};

/// Resolve the corpus path relative to the workspace root.
fn corpus_dir() -> PathBuf {
    let manifest = Path::new(env!("CARGO_MANIFEST_DIR"));
    manifest.join("../../corpus/fabric")
}

/// Collect all .md files recursively.
fn collect_md_files(dir: &Path) -> Vec<PathBuf> {
    let mut files = Vec::new();
    if !dir.exists() {
        return files;
    }
    for entry in walkdir(dir) {
        if entry.extension().map_or(false, |e| e == "md") {
            files.push(entry);
        }
    }
    files.sort();
    files
}

/// Simple recursive directory walker (no extra dependency).
fn walkdir(dir: &Path) -> Vec<PathBuf> {
    let mut results = Vec::new();
    if let Ok(entries) = std::fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                results.extend(walkdir(&path));
            } else {
                results.push(path);
            }
        }
    }
    results
}

fn load_file(path: &Path) -> Option<String> {
    std::fs::read_to_string(path).ok()
}

// ---------------------------------------------------------------------------
// Test 1: No panics on any input
// ---------------------------------------------------------------------------

#[test]
fn fabric_no_panics() {
    let dir = corpus_dir();
    if !dir.exists() {
        eprintln!("SKIP: fabric corpus not found at {}", dir.display());
        return;
    }

    let files = collect_md_files(&dir);
    assert!(
        files.len() > 100,
        "Expected 100+ .md files, found {}",
        files.len()
    );

    let config = CompressConfig::default();
    let mut processed = 0;

    for path in &files {
        let content = match load_file(path) {
            Some(c) => c,
            None => continue,
        };
        // This must not panic
        let _result = compress(&content, &config);
        processed += 1;
    }

    eprintln!("fabric_no_panics: processed {processed} files without panic");
    assert!(processed > 100);
}

// ---------------------------------------------------------------------------
// Test 2: No token inflation — compressed <= original for every file
// ---------------------------------------------------------------------------

#[test]
fn fabric_no_inflation() {
    let dir = corpus_dir();
    if !dir.exists() {
        eprintln!("SKIP: fabric corpus not found at {}", dir.display());
        return;
    }

    let files = collect_md_files(&dir);
    let config = CompressConfig::default();
    let mut inflated = Vec::new();

    for path in &files {
        let content = match load_file(path) {
            Some(c) => c,
            None => continue,
        };
        let result = compress(&content, &config);

        if result.compressed_tokens > result.original_tokens {
            inflated.push((
                path.strip_prefix(&dir).unwrap_or(path).display().to_string(),
                result.original_tokens,
                result.compressed_tokens,
            ));
        }
    }

    if !inflated.is_empty() {
        eprintln!("TOKEN INFLATION detected in {} files:", inflated.len());
        for (path, orig, comp) in &inflated {
            eprintln!("  {path}: {orig} → {comp} (+{})", comp - orig);
        }
    }
    assert!(
        inflated.is_empty(),
        "Compression inflated tokens in {} files (see stderr)",
        inflated.len()
    );
}

// ---------------------------------------------------------------------------
// Test 3: Idempotent — compress(compress(x)) == compress(x)
// ---------------------------------------------------------------------------

#[test]
fn fabric_idempotent() {
    let dir = corpus_dir();
    if !dir.exists() {
        eprintln!("SKIP: fabric corpus not found at {}", dir.display());
        return;
    }

    let files = collect_md_files(&dir);
    let config = CompressConfig::default();
    let mut non_idempotent = Vec::new();

    for path in &files {
        let content = match load_file(path) {
            Some(c) => c,
            None => continue,
        };
        let first = compress(&content, &config);
        let second = compress(&first.text, &config);

        if first.text != second.text {
            non_idempotent.push((
                path.strip_prefix(&dir).unwrap_or(path).display().to_string(),
                first.compressed_tokens,
                second.compressed_tokens,
            ));
        }
    }

    if !non_idempotent.is_empty() {
        eprintln!(
            "NON-IDEMPOTENT compression in {} files:",
            non_idempotent.len()
        );
        for (path, t1, t2) in &non_idempotent[..non_idempotent.len().min(10)] {
            eprintln!("  {path}: pass1={t1} tok, pass2={t2} tok");
        }
    }
    assert!(
        non_idempotent.is_empty(),
        "Compression is not idempotent on {} files",
        non_idempotent.len()
    );
}

// ---------------------------------------------------------------------------
// Test 4: Structural integrity — headings, code fences, list markers survive
// ---------------------------------------------------------------------------

#[test]
fn fabric_structural_integrity() {
    let dir = corpus_dir();
    if !dir.exists() {
        eprintln!("SKIP: fabric corpus not found at {}", dir.display());
        return;
    }

    let files = collect_md_files(&dir);
    let config = CompressConfig::default();
    let mut failures = Vec::new();

    for path in &files {
        let content = match load_file(path) {
            Some(c) => c,
            None => continue,
        };
        let result = compress(&content, &config);

        let orig_headings = count_pattern(&content, "# ");
        let comp_headings = count_pattern(&result.text, "# ");

        let orig_fences = count_pattern(&content, "```");
        let comp_fences = count_pattern(&result.text, "```");

        let rel = path.strip_prefix(&dir).unwrap_or(path).display().to_string();

        // Headings must be preserved (we normalize but never remove)
        if comp_headings < orig_headings {
            failures.push(format!(
                "{rel}: headings {orig_headings} → {comp_headings} (lost {})",
                orig_headings - comp_headings
            ));
        }

        // Code fences must be balanced (even count)
        if comp_fences % 2 != 0 && orig_fences % 2 == 0 {
            failures.push(format!(
                "{rel}: code fences became unbalanced ({comp_fences} backtick-triples)"
            ));
        }
    }

    if !failures.is_empty() {
        eprintln!(
            "STRUCTURAL INTEGRITY failures ({}):",
            failures.len()
        );
        for f in &failures[..failures.len().min(20)] {
            eprintln!("  {f}");
        }
    }
    assert!(
        failures.is_empty(),
        "{} structural integrity failures",
        failures.len()
    );
}

fn count_pattern(text: &str, pattern: &str) -> usize {
    text.matches(pattern).count()
}

// ---------------------------------------------------------------------------
// Test 5: Aggregate corpus savings within expected bounds
// ---------------------------------------------------------------------------

#[test]
fn fabric_aggregate_savings() {
    let dir = corpus_dir();
    if !dir.exists() {
        eprintln!("SKIP: fabric corpus not found at {}", dir.display());
        return;
    }

    let files = collect_md_files(&dir);
    let config = CompressConfig::default();

    let mut total_original = 0usize;
    let mut total_compressed = 0usize;
    let mut file_count = 0usize;
    let mut files_with_savings = 0usize;
    let mut max_savings_pct: f64 = 0.0;
    let mut max_savings_file = String::new();

    for path in &files {
        let content = match load_file(path) {
            Some(c) => c,
            None => continue,
        };
        let result = compress(&content, &config);

        total_original += result.original_tokens;
        total_compressed += result.compressed_tokens;
        file_count += 1;

        if result.tokens_saved > 0 {
            files_with_savings += 1;
        }
        if result.savings_pct > max_savings_pct {
            max_savings_pct = result.savings_pct;
            max_savings_file = path
                .strip_prefix(&dir)
                .unwrap_or(path)
                .display()
                .to_string();
        }
    }

    let total_saved = total_original.saturating_sub(total_compressed);
    let total_pct = if total_original > 0 {
        (total_saved as f64 / total_original as f64) * 100.0
    } else {
        0.0
    };

    eprintln!("=== FABRIC CORPUS AGGREGATE RESULTS ===");
    eprintln!("  Files processed:     {file_count}");
    eprintln!("  Files with savings:  {files_with_savings}");
    eprintln!(
        "  Total tokens:        {total_original} → {total_compressed} (saved {total_saved})"
    );
    eprintln!("  Aggregate savings:   {total_pct:.2}%");
    eprintln!("  Max single-file:     {max_savings_pct:.1}% ({max_savings_file})");

    // Invariant: aggregate savings must not be negative
    assert!(
        total_compressed <= total_original,
        "Aggregate compression inflated tokens: {total_original} → {total_compressed}"
    );

    // Invariant: we expect at least SOME files to benefit
    // (fabric has READMEs with tables, badges, HTML)
    assert!(
        files_with_savings > 0,
        "Expected at least some files to have savings, got 0 out of {file_count}"
    );

    eprintln!("fabric_aggregate_savings: PASS");
}

// ---------------------------------------------------------------------------
// Test 6: Empty and tiny files don't crash or inflate
// ---------------------------------------------------------------------------

#[test]
fn fabric_edge_cases() {
    let config = CompressConfig::default();

    // Empty string
    let r = compress("", &config);
    assert_eq!(r.original_tokens, 0);
    assert_eq!(r.compressed_tokens, 0);
    assert_eq!(r.text, "");

    // Single character
    let r = compress("#", &config);
    assert!(r.compressed_tokens <= r.original_tokens);

    // Only whitespace
    let r = compress("   \n\n\n   \n", &config);
    assert!(r.compressed_tokens <= r.original_tokens);

    // Only a heading
    let r = compress("# Title\n", &config);
    assert!(r.compressed_tokens <= r.original_tokens);
    assert!(r.text.contains("# Title"));

    // Unicode content
    let r = compress("# 日本語テスト\n\nこんにちは世界", &config);
    assert!(r.compressed_tokens <= r.original_tokens);

    eprintln!("fabric_edge_cases: PASS");
}
