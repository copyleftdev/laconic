//! Code fence compaction — reduce excess indentation inside code blocks.

use std::sync::LazyLock;

use regex::Regex;

static FENCE_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?s)```(\w*)\n(.*?)\n```").expect("valid regex"));

/// Compact code blocks by removing common leading indentation.
pub fn compact(input: &str) -> String {
    FENCE_RE
        .replace_all(input, |caps: &regex::Captures| {
            let lang = &caps[1];
            let code = &caps[2];

            let non_empty: Vec<&str> = code.lines().filter(|l| !l.trim().is_empty()).collect();

            if non_empty.is_empty() {
                return format!("```{lang}\n{code}\n```");
            }

            let min_indent = non_empty
                .iter()
                .map(|l| l.len() - l.trim_start().len())
                .min()
                .unwrap_or(0);

            if min_indent == 0 {
                return format!("```{lang}\n{code}\n```");
            }

            let dedented: Vec<String> = code
                .lines()
                .map(|l| {
                    if l.len() >= min_indent {
                        l[min_indent..].to_string()
                    } else {
                        l.to_string()
                    }
                })
                .collect();

            format!("```{lang}\n{}\n```", dedented.join("\n"))
        })
        .into_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn removes_common_indent() {
        let input = "```rust\n    fn main() {\n        println!(\"hi\");\n    }\n```";
        let expected = "```rust\nfn main() {\n    println!(\"hi\");\n}\n```";
        assert_eq!(compact(input), expected);
    }

    #[test]
    fn leaves_unindented_code() {
        let input = "```\nfoo\nbar\n```";
        assert_eq!(compact(input), input);
    }
}
