//! Decorative HTML stripping — remove presentational wrappers, keep content.

use std::sync::LazyLock;

use regex::Regex;

static STYLE_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r#"\s+style="[^"]*""#).expect("valid regex"));

static DIV_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?si)<div[^>]*>\s*(.*?)\s*</div>").expect("valid regex"));

/// Remove purely decorative/presentational HTML.
///
/// - Strips `style="..."` attributes.
/// - Unwraps `<div>` wrappers (preserves inner content).
pub fn strip_decorative(input: &str) -> String {

    let mut result = STYLE_RE.replace_all(input, "").into_owned();

    for _ in 0..5 {
        let prev = result.clone();
        result = DIV_RE.replace_all(&result, "$1").into_owned();
        if result == prev {
            break;
        }
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strips_style_attributes() {
        let input = r#"<span style="color: red">hello</span>"#;
        assert_eq!(strip_decorative(input), "<span>hello</span>");
    }

    #[test]
    fn unwraps_divs() {
        let input = r#"<div class="wrapper">content here</div>"#;
        assert_eq!(strip_decorative(input), "content here");
    }

    #[test]
    fn handles_nested_divs() {
        let input = "<div><div>inner</div></div>";
        assert_eq!(strip_decorative(input), "inner");
    }
}
