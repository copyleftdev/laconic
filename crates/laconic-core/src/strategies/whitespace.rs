//! Whitespace normalization: collapse blank lines, strip trailing spaces.

/// Normalize whitespace in markdown text.
///
/// - Strips trailing whitespace per line.
/// - Collapses 3+ consecutive blank lines to 2.
pub fn normalize(input: &str) -> String {
    let mut result = Vec::new();
    let mut blank_count = 0u32;

    for line in input.lines() {
        let trimmed = line.trim_end();
        if trimmed.is_empty() {
            blank_count += 1;
            if blank_count <= 2 {
                result.push("");
            }
        } else {
            blank_count = 0;
            result.push(trimmed);
        }
    }

    result.join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn collapses_triple_blank_lines() {
        let input = "a\n\n\n\nb";
        assert_eq!(normalize(input), "a\n\n\nb");
    }

    #[test]
    fn strips_trailing_spaces() {
        let input = "hello   \nworld  ";
        assert_eq!(normalize(input), "hello\nworld");
    }

    #[test]
    fn preserves_double_blank() {
        let input = "a\n\nb";
        assert_eq!(normalize(input), "a\n\nb");
    }
}
