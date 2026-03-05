//! Heading normalization — consistent ATX-style, strip trailing hashes.

use std::sync::LazyLock;

use regex::Regex;

static HEADING_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^(#{1,6})\s+(.*?)\s*#*\s*$").expect("valid regex"));

/// Normalize headings: remove trailing `#` characters from ATX headings.
pub fn normalize(input: &str) -> String {

    input
        .lines()
        .map(|line| {
            if let Some(caps) = HEADING_RE.captures(line) {
                format!("{} {}", &caps[1], &caps[2])
            } else {
                line.to_string()
            }
        })
        .collect::<Vec<_>>()
        .join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strips_trailing_hashes() {
        let input = "## Hello ##";
        assert_eq!(normalize(input), "## Hello");
    }

    #[test]
    fn leaves_clean_headings() {
        let input = "# Title";
        assert_eq!(normalize(input), "# Title");
    }

    #[test]
    fn preserves_non_headings() {
        let input = "Just some text.";
        assert_eq!(normalize(input), "Just some text.");
    }
}
