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
            vec![EOF(pos(1, 1))],
        );
    }

    #[test]
    fn it_scans_mutiple_lines() {
        assert_eq!(
            scan("  (  \n  )  ").unwrap(),
            vec![BracketOpen(pos(1, 3)), BracketClose(pos(2, 3)), EOF(pos(2, 6))],
        );
    }

    #[test]
    fn it_scans_simple_function() {
        assert_eq!(
            scan("λa.b").unwrap(),
            vec![Lambda(pos(1, 1)), Symbol(pos(1, 2), "a".to_string()),
                Dot(pos(1, 3)), Symbol(pos(1, 4), "b".to_string()),
                EOF(pos(1, 5))
            ],
        );
    }

    #[test]
    fn it_scans_camel_case_symbol() {
        assert_eq!(
            scan("camelCase").unwrap(),
            vec![Symbol(pos(1,1), "camelCase".to_string()), EOF(pos(1, 10))],
        );
    }

    fn pos(line: u16, col: u16) -> SrcPosition {
        SrcPosition { line, col }
    }
}

#[derive(PartialEq)]
#[derive(Debug)]
pub enum Token {
    Lambda(SrcPosition),
    Dot(SrcPosition),
    BracketOpen(SrcPosition),
    BracketClose(SrcPosition),
    Symbol(SrcPosition, String),
    EOF(SrcPosition),
}

#[derive(PartialEq)]
#[derive(Debug)]
pub struct SrcPosition {
    line: u16,
    col: u16,
}

pub fn scan(src: &str) -> Result<Vec<Token>, Error> {
    let mut v: Vec<Token> = Vec::new();
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
            v.push(Token::Symbol(pos, word));
            continue;
        }

        let pos = SrcPosition { line, col };
        let t = match c {
            '(' => Token::BracketOpen(pos),
            ')' => Token::BracketClose(pos),
            'λ' => Token::Lambda(pos),
            '\\' => Token::Lambda(pos),
            '.' => Token::Dot(pos),
            _ => Token::EOF(pos), // TODO: ERROR
        };
        v.push(t);
    }

    v.push(Token::EOF(SrcPosition { line, col: col + 1 }));
    Ok(v)
}
