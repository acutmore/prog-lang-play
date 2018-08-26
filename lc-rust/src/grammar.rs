
/**
 * program -> expression EOF .
 * expression -> apply .
 * apply -> lamb lamb* .
 * lamb -> `λ` VAR `.` apply .
 * lamb -> primary .
 * primary -> `(` expression `)` .
 * primary -> `let` VAR `=` expression (`,` VAR `=` expression)* `in` expression .
 * primary -> VAR .
 * primary -> INT .
 *
 * Grammar is implemented in a recursive decent style
 */

#[cfg(test)]
mod tests {
    use super::*;
    use scanner::scan;

    struct PrettyPrinter {}
    impl Visitor<String> for PrettyPrinter {
        fn visit_expression(&mut self, e: &Expression) -> String {
            match e {
                &Expression::Symbol(ref s) =>
                    format!("Symbol({})", s.id),
                &Expression::Function(ref s, ref body) =>
                    format!("Func({}){{{}}}", s.id, body.accept(self)),
                &Expression::Application(ref left, ref right) =>
                    format!("Apply({}, {})", left.accept(self), right.accept(self)),
            }
        }
    }

    #[test]
    fn it_parses_a_simple_function() {
        assert_eq!(
            parse(scan("λa.b").unwrap()).unwrap().accept(&mut PrettyPrinter {}),
            "Func(a){Symbol(b)}",
        );
    }

    #[test]
    fn it_parses_brackets() {
        assert_eq!(
            parse(scan("(λa.(b))(λc.d)").unwrap()).unwrap().accept(&mut PrettyPrinter {}),
            "Apply(Func(a){Symbol(b)}, Func(c){Symbol(d)})",
        );
    }

    #[test]
    fn it_greedy_parses_function_bodies() {
        assert_eq!(
            parse(scan("λx.m n").unwrap()).unwrap().accept(&mut PrettyPrinter {}),
            "Func(x){Apply(Symbol(m), Symbol(n))}",
        );
    }

    #[test]
    fn it_parses_function_application_as_left_associative() {
        assert_eq!(
            parse(scan("m n p").unwrap()).unwrap().accept(&mut PrettyPrinter {}),
            "Apply(Apply(Symbol(m), Symbol(n)), Symbol(p))",
        );
    }

    #[test]
    fn it_has_syntatic_sugar_for_int_literal() {
        assert_eq!(
            parse(scan("1").unwrap()).unwrap().accept(&mut PrettyPrinter {}),
            "Func(f){Func(x){Apply(Symbol(f), Symbol(x))}}",
        );
    }

    #[test]
    fn it_has_syntatic_sugar_for_let_expressions() {
        assert_eq!(
            parse(scan("let a = b, c = d in e").unwrap()).unwrap().accept(&mut PrettyPrinter {}),
            "Apply(Func(a){Apply(Func(c){Symbol(e)}, Symbol(d))}, Symbol(b))",
        );
    }
}

use syntax::*;
use scanner::Token;
use scanner::SrcPosition;
use scanner::SrcToken;
use error::*;
use std::iter;
use std::vec;

type TokenIt = vec::IntoIter<SrcToken>;
type PeekableTokens = iter::Peekable<TokenIt>;

pub fn parse(tokens: Vec<SrcToken>) -> Result<Box<Expression>, Error> {
    let mut it = tokens.into_iter().peekable();
    program(&mut it)
}

// program -> expression EOF .
fn program(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    let e = expression(it)?;
    match it.peek() {
        None
        | Some(&SrcToken(Token::EOF, _)) => Ok(e),
        Some(&SrcToken(_, ref pos)) => Err(Error { msg: "expected EOF".to_string(), at: *pos, }),
    }
}

// expression -> apply .
fn expression(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    apply(it)
}

// apply -> lamb lamb* .
fn apply(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    let mut e = lamb(it)?;
    loop {
        match it.peek() {
            Some(&SrcToken(Token::BracketClose, _))
            | Some(&SrcToken(Token::Dot, _))
            | Some(&SrcToken(Token::In, _))
            | Some(&SrcToken(Token::Comma, _))
            | Some(&SrcToken(Token::EOF, _)) => return Ok(e),
            _ => {
                let rhs = lamb(it)?;
                e = lc!{(e rhs)}
            }
        }
    }
}

// lamb -> `λ` VAR `.` expression .
// lamb -> prmary .
fn lamb(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    match it.peek() {
        Some(&SrcToken(Token::Lambda, _)) => get_lamb(it),
        _ => primary(it),
    }
}

// primary -> '(' expression ')' .
// primary -> `let` VAR `=` expression (`,` VAR `=` expression)* `in` expression .
// primary -> VAR .
// primary -> INT .
fn primary(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    enum PrimaryType {
        Bracket,
        Let,
        Symbol,
        Int,
        Error(SrcPosition)
    };

    let primary_type = match it.peek() {
        Some(&SrcToken(Token::BracketOpen, _)) => PrimaryType::Bracket,
        Some(&SrcToken(Token::Let, _)) => PrimaryType::Let,
        Some(&SrcToken(Token::Symbol(_), _)) => PrimaryType::Symbol,
        Some(&SrcToken(Token::Integer(_), _)) => PrimaryType::Int,
        Some(&SrcToken(_, ref pos)) => PrimaryType::Error(*pos),
        None => panic!("there should always be another token to peek at"),
    };

    match primary_type {
        PrimaryType::Bracket => get_bracket_expression(it),
        PrimaryType::Let => get_let_expressions(it),
        PrimaryType::Symbol => get_symbol(it),
        PrimaryType::Int => get_church_numeral(it),
        PrimaryType::Error(ref pos) => Err(Error {
            msg: "expected '(' or a symbol".to_string(),
            at: *pos,
        }),
    }
}

// get_lamb -> `λ` VAR `.` expression .
fn get_lamb(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    match it.next().unwrap() {
        SrcToken(Token::Lambda, _) => Ok(()),
        SrcToken(_, pos) => Err(Error {
            msg: "expected lamba".to_string(),
            at: pos,
        }),
    }?;

    let param = match it.next().unwrap() {
        SrcToken(Token::Symbol(s), pos) => Ok((s, pos)),
        SrcToken(_, pos) => Err(Error {
            msg: "expected symbol".to_string(),
            at: pos,
        }),
    }?;

    match it.next().unwrap() {
        SrcToken(Token::Dot, _) => Ok(()),
        SrcToken(_, pos) => Err(Error {
            msg: "expected dot".to_string(),
            at: pos,
        }),
    }?;

    let body = expression(it)?;
    Ok(lc!{λ{param}.body})
}

// get_bracket_expression -> '(' expression ')' .
fn get_bracket_expression(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    match it.next().unwrap() {
        SrcToken(Token::BracketOpen, _) => Ok(()),
        SrcToken(_, pos) => Err(Error {
            msg: "expected '('".to_string(),
            at: pos,
        }),
    }?;
    let e = expression(it)?;
    match it.peek().unwrap() {
        &SrcToken(Token::BracketClose, _) => Ok(()),
        SrcToken(_, ref pos) => Err(Error {
            msg: "expected ')'".to_string(),
            at: *pos,
        }),
    }?;
    it.next();
    Ok(e)
}

// get_let_expressions -> `let` VAR `=` expression (`,` VAR `=` expression)* `in` expression .
fn get_let_expressions(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    let mut vars_and_values = Vec::new();

    // let
    match it.next().unwrap() {
        SrcToken(Token::Let, _) => Ok(()),
        SrcToken(_, pos) => Err(Error {
            msg: "expected 'let'".to_string(),
            at: pos,
        }),
    }?;

    loop {
        // VAR
        let var = match it.next().unwrap() {
            SrcToken(Token::Symbol(s), pos) => Ok((s, pos)),
            SrcToken(_, pos) => Err(Error {
                msg: "expected symbol".to_string(),
                at: pos,
            }),
        }?;
        // =
        match it.next().unwrap() {
            SrcToken(Token::Equals, _) => Ok(()),
            SrcToken(_, pos) => Err(Error {
                msg: "expected '='".to_string(),
                at: pos,
            }),
        }?;
        // expression
        let value = expression(it)?;
        vars_and_values.push((var, value));

        if let Some(&SrcToken(Token::Comma, _)) = it.peek() {
            it.next();
        } else {
            break;
        }
    }

    // in
    match it.next().unwrap() {
        SrcToken(Token::In, _) => Ok(()),
        SrcToken(_, pos) => Err(Error {
            msg: "expected 'in'".to_string(),
            at: pos,
        }),
    }?;
    // expression
    let exp = expression(it)?;

    // syntatic sugar: (var1 => (varN => expression)(valueN))(value1)
    Ok(vars_and_values.into_iter().rev().fold(exp, |exp, (var, value)| {
        let f = lc!{λ{var}.exp};
        lc!{(f value)}
    }))
}

// get_symbol -> VAR
fn get_symbol(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    match it.next().unwrap() {
        SrcToken(Token::Symbol(s), pos) => Ok(lc!{{(s, pos)}}),
        SrcToken(_, pos) => Err(Error {
            msg: "expected a symbol".to_string(),
            at: pos,
        }),
    }
}

/// Given a token iterator parked before an integer literal
/// will consume and return the coresponding church numeral
fn get_church_numeral(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    match it.next().unwrap() {
        SrcToken(Token::Integer(int_value), _) => {
            Ok(::values::numerals::get_church_numeral(int_value))
        },
        SrcToken(_, pos) => Err(Error {
            msg: "expected an integer literal".to_string(),
            at: pos,
        }),
    }
}
