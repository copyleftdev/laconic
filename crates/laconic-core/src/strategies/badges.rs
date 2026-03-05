//! Badge/shield image stripping.

use std::sync::LazyLock;

use regex::Regex;

static LINKED_BADGE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"\[!\[([^\]]*)\]\([^)]*(?:shields\.io|badge|img\.shields)[^)]*\)\]\(([^)]+)\)")
        .expect("valid regex")
});

static STANDALONE_BADGE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"!\[[^\]]*\]\([^)]*(?:shields\.io|badge|img\.shields)[^)]*\)")
        .expect("valid regex")
});

/// Remove badge/shield images that are purely decorative.
///
/// `[![Build Status](https://img.shields.io/...)](https://...)` → `[Build Status](https://...)`
/// `![badge](https://img.shields.io/...)` → removed
pub fn strip(input: &str) -> String {

    let result = LINKED_BADGE.replace_all(input, "[$1]($2)");
    let result = STANDALONE_BADGE.replace_all(&result, "");

    result.into_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strips_linked_badge() {
        let input = "[![CI](https://img.shields.io/badge/ci-pass-green)](https://ci.example.com)";
        let expected = "[CI](https://ci.example.com)";
        assert_eq!(strip(input), expected);
    }

    #[test]
    fn strips_standalone_badge() {
        let input = "Hello ![status](https://img.shields.io/badge/ok-green) world";
        let expected = "Hello  world";
        assert_eq!(strip(input), expected);
    }

    #[test]
    fn leaves_normal_images() {
        let input = "![photo](https://example.com/photo.jpg)";
        assert_eq!(strip(input), input);
    }
}
