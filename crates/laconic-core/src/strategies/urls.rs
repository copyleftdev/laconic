//! URL deduplication — convert repeated inline links to reference-style.

use std::collections::HashMap;
use std::sync::LazyLock;

use regex::Regex;

static LINK_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"\[([^\]]+)\]\(([^)]+)\)").expect("valid regex"));

/// Convert repeated or very long inline links to reference-style links.
///
/// Only converts URLs that appear 2+ times or exceed 60 characters.
/// Note: disabled by default in `CompressConfig` as it can increase
/// token count on typical documents.
pub fn deduplicate(input: &str) -> String {
    let matches: Vec<(String, String)> = LINK_RE
        .captures_iter(input)
        .map(|c| (c[1].to_string(), c[2].to_string()))
        .collect();

    if matches.is_empty() {
        return input.to_string();
    }

    let mut url_counts: HashMap<&str, usize> = HashMap::new();
    for (_, url) in &matches {
        *url_counts.entry(url.as_str()).or_insert(0) += 1;
    }

    let mut urls_to_convert: HashMap<String, String> = HashMap::new();
    let mut ref_num = 1usize;
    for (url, count) in &url_counts {
        if *count >= 2 || url.len() > 60 {
            urls_to_convert.insert(url.to_string(), ref_num.to_string());
            ref_num += 1;
        }
    }

    if urls_to_convert.is_empty() {
        return input.to_string();
    }

    let result = LINK_RE.replace_all(input, |caps: &regex::Captures| {
        let text = &caps[1];
        let url = &caps[2];
        if let Some(ref_id) = urls_to_convert.get(url) {
            format!("[{text}][{ref_id}]")
        } else {
            caps[0].to_string()
        }
    });

    let mut result = result.into_owned();
    result.push_str("\n\n");
    for (url, ref_id) in &urls_to_convert {
        result.push_str(&format!("[{ref_id}]: {url}\n"));
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deduplicates_repeated_urls() {
        let input = "[a](https://example.com) and [b](https://example.com)";
        let result = deduplicate(input);
        assert!(result.contains("[a][1]") || result.contains("[a]["));
        assert!(result.contains("[1]: https://example.com"));
    }

    #[test]
    fn leaves_unique_short_urls() {
        let input = "[link](https://a.com)";
        assert_eq!(deduplicate(input), input);
    }
}
