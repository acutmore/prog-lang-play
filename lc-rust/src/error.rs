
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_formats_error_one_line_src() {
        assert_eq!(
            err("unexpected character", 1, 5)
                .detailed_msg("let @ = foo"),
            format!("{}\n{}\n{}",
                "(1,5) error : unexpected character",
                "let @ = foo",
                "    ^",
            ),
        );
    }

    #[test]
    fn it_formats_error_multi_line_src() {
        assert_eq!(
            err("expected '.'", 2, 6)
                .detailed_msg(&format!(
                    "{}\n{}\n{}",
                    "// line one",
                    "(λxx λ xx)",
                    "// line three",
                )),
            format!("{}\n{}\n{}",
                "(2,6) error : expected '.'",
                "(λxx λ xx)",
                "     ^",
            ),
        );
    }

    fn err(msg: &'static str, line: u16, col: u16) -> Error {
        Error { msg: msg.to_string(), at: SrcPosition { line, col } }
    }
}

use scanner::SrcPosition;

#[derive(Debug)]
pub struct Error {
    pub msg: String,
    pub at: SrcPosition,
}

impl Error {
    pub fn detailed_msg(&self, src: &str) -> String {
        format!(
            "({},{}) error : {}\n{}\n{}",
            self.at.line,
            self.at.col,
            self.msg,
            get_line(self.at.line, src),
            error_position_indicator(self.at.col),
        )
    }
}

fn get_line(line: u16, src: &str) -> &str {
    src.lines().nth((line - 1) as usize).unwrap_or("")
}

fn error_position_indicator(col: u16) -> String {
    format!("{}{}", " ".repeat((col - 1) as usize), "^")
}
