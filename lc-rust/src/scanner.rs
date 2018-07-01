use error::*;
use regex::Regex;

#[cfg(test)]
mod tests {
    use super::*;
    use self::Token::*;

    #[test]
    fn it_scans_empty() {
        assert_eq!(
            scan("").unwrap(),
            vec![SrcToken(EOF, pos(1, 1))],
        );
    }

    #[test]
    fn it_scans_mutiple_lines() {
        assert_eq!(
            scan("  (  \n  )  ").unwrap(),
            vec![SrcToken(BracketOpen, pos(1, 3)), SrcToken(BracketClose, pos(2, 3)), SrcToken(EOF, pos(2, 6))],
        );
    }

    #[test]
    fn it_scans_simple_function() {
        assert_eq!(
            scan("λa.b").unwrap(),
            vec![SrcToken(Lambda, pos(1, 1)), SrcToken(Symbol("a".to_string()), pos(1, 2)),
                SrcToken(Dot, pos(1, 3)), SrcToken(Symbol("b".to_string()), pos(1, 4)),
                SrcToken(EOF, pos(1, 5))
            ],
        );
    }

    #[test]
    fn it_scans_camel_case_symbol() {
        assert_eq!(
            scan("camelCase").unwrap(),
            vec![SrcToken(Symbol("camelCase".to_string()), pos(1, 1)), SrcToken(EOF, pos(1, 10))],
        );
    }

    #[test]
    fn it_scans_integers() {
        assert_eq!(
            scan("123456").unwrap(),
            vec![SrcToken(Integer(123456), pos(1, 1)), SrcToken(EOF, pos(1, 7))],
        );
    }

    #[test]
    fn it_scans_let_expression() {
        assert_eq!(
            scan("let f = b in e").unwrap(),
            vec![
                SrcToken(Let, pos(1, 1)),
                SrcToken(Symbol("f".to_string()), pos(1, 5)),
                SrcToken(Equals, pos(1, 7)),
                SrcToken(Symbol("b".to_string()), pos(1, 9)),
                SrcToken(In, pos(1, 11)),
                SrcToken(Symbol("e".to_string()), pos(1, 14)),
                SrcToken(EOF, pos(1, 15)),
            ],
        );
    }

    #[test]
    fn it_produces_an_error() {
        assert_eq!(
            scan("!").unwrap_err().msg,
            "Unexpected character: '!'"
        );
    }

    #[test]
    fn it_includes_position_in_errors() {
        assert_eq!(
            scan("!").unwrap_err().at,
            pos(1, 1)
        );
    }

    fn pos(line: u16, col: u16) -> SrcPosition {
        SrcPosition { line, col }
    }
}

#[derive(PartialEq)]
#[derive(Debug)]
pub struct SrcToken (
    pub Token,
    pub SrcPosition,
);

#[derive(PartialEq)]
#[derive(Debug)]
pub enum Token {
    Lambda,
    Dot,
    BracketOpen,
    BracketClose,
    Symbol(String),
    Integer(u32),
    Let,
    Equals,
    In,
    Comma,
    EOF,
}

#[derive(PartialEq)]
#[derive(Debug)]
#[derive(Clone, Copy)]
pub struct SrcPosition {
    pub line: u16,
    pub col: u16,
}

pub fn scan(src: &str) -> Result<Vec<SrcToken>, Error> {
    let mut v: Vec<SrcToken> = Vec::new();
    let mut line: u16 = 1;
    let mut col: u16 = 0;
    let mut chars = src.chars().peekable();

    loop {
        let c = chars.next();
        if c.is_none() { break }
        let c = c.unwrap();
        col = col + 1;

        if c == '\n' {
            line = line + 1;
            col = 0;
            continue;
        }
        lazy_static! {
            static ref WHITESPACE: Regex = Regex::new(r"\s").unwrap();
        }
        if WHITESPACE.is_match(&c.to_string()) {
            continue;
        }

        lazy_static! {
            static ref INTEGER: Regex = Regex::new(r"[0-9]").unwrap();
        }
        if INTEGER.is_match(&c.to_string()) {
            let pos = SrcPosition { line, col };
            let mut int_literal = c.to_string();
            loop {
                match chars.peek() {
                    None => break,
                    Some(c) => if INTEGER.is_match(&c.to_string()) {
                        int_literal.push(*c);
                        col = col + 1;
                    } else {
                        break;
                    }
                }
                chars.next();
            }
            let numeric_value = int_literal.parse::<u32>().unwrap();
            v.push(SrcToken(Token::Integer(numeric_value), pos));
            continue;
        }

        lazy_static! {
            static ref SYMBOL_HEAD: Regex = Regex::new(r"[_a-zA-Z]").unwrap();
        }
        lazy_static! {
            static ref SYMBOL_TAIL: Regex = Regex::new(r"[_a-zA-Z0-9]").unwrap();
        }
        if SYMBOL_HEAD.is_match(&c.to_string()) {
            let pos = SrcPosition { line, col };
            let mut word = c.to_string();
            loop {
                match chars.peek() {
                    None => break,
                    Some(c) => if SYMBOL_TAIL.is_match(&c.to_string()) {
                        word.push(*c);
                        col = col + 1;
                    } else {
                        break;
                    }
                }
                chars.next();
            }

            // Keywords
            let token = match word.as_ref() {
                "let" => Token::Let,
                "in" => Token::In,
                _ => Token::Symbol(word),
            };

            v.push(SrcToken(token, pos));
            continue;
        }

        let pos = SrcPosition { line, col };
        let t = match c {
            '(' => Token::BracketOpen,
            ')' => Token::BracketClose,
            'λ' => Token::Lambda,
            '\\' => Token::Lambda,
            '.' => Token::Dot,
            '=' => Token::Equals,
            ',' => Token::Comma,
            _ => return Err(Error {
                msg: format!("Unexpected character: '{}'", c),
                at: pos,
            }),
        };
        v.push(SrcToken(t, pos));
    }

    v.push(SrcToken(Token::EOF, SrcPosition { line, col: col + 1 }));
    Ok(v)
}
