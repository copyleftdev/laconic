//! Token counting using tiktoken (cl100k_base, GPT-4/4o).

use std::sync::LazyLock;

use tiktoken_rs::{cl100k_base, CoreBPE};

static BPE: LazyLock<CoreBPE> =
    LazyLock::new(|| cl100k_base().expect("failed to load cl100k_base tokenizer"));

/// Count tokens in text using the cl100k_base encoding.
pub fn count(text: &str) -> usize {
    BPE.encode_with_special_tokens(text).len()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn counts_simple_text() {
        let n = count("Hello, world!");
        assert!(n > 0 && n < 10);
    }

    #[test]
    fn empty_string_is_zero() {
        assert_eq!(count(""), 0);
    }
}
