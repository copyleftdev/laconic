//! Markdown table → compact CSV-like conversion.

use std::sync::LazyLock;

use regex::Regex;

static SEPARATOR_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^\|[\s\-:]+(\|[\s\-:]+)+\|$").expect("valid regex"));

/// Convert markdown tables to compact CSV-like format.
///
/// Replaces:
/// ```text
/// | Col1 | Col2 | Col3 |
/// |------|------|------|
/// | a    | b    | c    |
/// ```
///
/// With:
/// ```text
/// [Col1,Col2,Col3]
/// a,b,c
/// ```
pub fn compact(input: &str) -> String {
    let lines: Vec<&str> = input.lines().collect();
    let mut result = Vec::new();
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i].trim();

        if line.starts_with('|') && line.ends_with('|') && i + 1 < lines.len() {
            let next_line = lines[i + 1].trim();

            if SEPARATOR_RE.is_match(next_line) {
                let headers = extract_cells(line);
                result.push(format!("[{}]", headers.join(",")));
                i += 2;

                while i < lines.len() {
                    let row = lines[i].trim();
                    if row.starts_with('|') && row.ends_with('|') {
                        let cells = extract_cells(row);
                        result.push(cells.join(","));
                        i += 1;
                    } else {
                        break;
                    }
                }
                continue;
            }
        }

        result.push(lines[i].to_string());
        i += 1;
    }

    result.join("\n")
}

fn extract_cells(row: &str) -> Vec<String> {
    row.split('|')
        .skip(1)
        .take_while(|s| !s.is_empty() || row.ends_with('|'))
        .filter(|s| !s.is_empty() || false)
        .map(|s| s.trim().to_string())
        .collect::<Vec<_>>()
        .into_iter()
        .filter(|s| !s.is_empty())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn converts_simple_table() {
        let input = "| A | B |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |";
        let expected = "[A,B]\n1,2\n3,4";
        assert_eq!(compact(input), expected);
    }

    #[test]
    fn leaves_non_tables_alone() {
        let input = "# Hello\n\nSome text.";
        assert_eq!(compact(input), input);
    }

    #[test]
    fn handles_alignment_markers() {
        let input = "| L | C | R |\n|:--|:--:|--:|\n| a | b | c |";
        let expected = "[L,C,R]\na,b,c";
        assert_eq!(compact(input), expected);
    }
}
