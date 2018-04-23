
/**
 * program -> expression EOF .
 * expression -> apply .
 * apply -> lamb lamb* .
 * lamb -> `λ` VAR `.` apply .
 * lamb -> primary .
 * primary -> `(` expression `)` .
 * primary -> VAR .
 *
 * Grammar is implemented in a recursive decent style
 */

#[cfg(test)]
mod tests {
    use super::*;
    use scanner::scan;

    struct PrettyPrinter {}
    impl Visitor<String> for PrettyPrinter {
        fn visit_expression(&self, e: &Expression) -> String {
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
            parse(scan("λa.b").unwrap()).unwrap().accept(&PrettyPrinter {}),
            "Func(a){Symbol(b)}",
        );
    }

    #[test]
    fn it_parses_brackets() {
        assert_eq!(
            parse(scan("(λa.(b))(λc.d)").unwrap()).unwrap().accept(&PrettyPrinter {}),
            "Apply(Func(a){Symbol(b)}, Func(c){Symbol(d)})",
        );
    }

    #[test]
    fn it_greedy_parses_function_bodies() {
        assert_eq!(
            parse(scan("λx.m n").unwrap()).unwrap().accept(&PrettyPrinter {}),
            "Func(x){Apply(Symbol(m), Symbol(n))}",
        );
    }

    #[test]
    fn it_parses_function_application_as_left_associative() {
        assert_eq!(
            parse(scan("m n p").unwrap()).unwrap().accept(&PrettyPrinter {}),
            "Apply(Apply(Symbol(m), Symbol(n)), Symbol(p))",
        );
    }
}

use syntax::*;
use scanner::Token;
use error::*;
use std::iter;
use std::vec;

type TokenIt = vec::IntoIter<Token>;
type PeekableTokens = iter::Peekable<TokenIt>;

pub fn parse(tokens: Vec<Token>) -> Result<Box<Expression>, Error> {
    let mut it = tokens.into_iter().peekable();
    program(&mut it)
}

// program -> expression EOF .
fn program(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    let e = expression(it)?;
    match it.peek() {
        Some(&Token::EOF(_)) => Ok(e),
        _ => Err(Error { msg: "expected EOF".to_string() }),
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
            Some(&Token::BracketClose(_)) |
            Some(&Token::Dot(_)) |
            Some(&Token::EOF(_)) => return Ok(e),
            _ => {
                e = Box::new(Expression::Application(
                    e,
                    lamb(it)?
                ));
            }
        }
    }
}

// lamb -> `λ` VAR `.` expression .
// lamb -> prmary .
fn lamb(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    match it.peek() {
        Some(&Token::Lambda(_)) => get_lamb(it),
        _ => primary(it),
    }
}

// primary -> '(' expression ')' .
// primary -> VAR .
fn primary(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    match it.peek() {
        Some(&Token::BracketOpen(_)) => get_bracket_expression(it),
        Some(&Token::Symbol(_, _)) => get_symbol(it),
        _ => Err(Error { msg: "expected '(' or a symbol".to_string() }),
    }
}

// get_lamb -> `λ` VAR `.` expression .
fn get_lamb(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    match it.next() {
        Some(Token::Lambda(_)) => Ok(()),
        _ => Err(Error { msg: "expected lamba".to_string() }),
    }?;

    let param = match it.next() {
        Some(Token::Symbol(_, s)) => Ok(s),
        _ => Err(Error { msg: "expected symbol".to_string() }),
    }?;

    match it.next() {
        Some(Token::Dot(_)) => Ok(()),
        _ => Err(Error { msg: "expected dot".to_string() }),
    }?;

    let body = expression(it)?;
    Ok(Box::new(Expression::Function(
        SymbolInfo::new(param),
        body
    )))
}

// get_bracket_expression -> '(' expression ')' .
fn get_bracket_expression(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    match it.next() {
        Some(Token::BracketOpen(_)) => Ok(()),
        _ => Err(Error { msg: "expected '('".to_string() }),
    }?;
    let e = expression(it)?;
    match it.peek() {
        Some(&Token::BracketClose(_)) => Ok(()),
        _ => Err(Error { msg: "expected ')'".to_string() }),
    }?;
    it.next();
    Ok(e)
}

// get_symbol -> VAR
fn get_symbol(it: &mut PeekableTokens) -> Result<Box<Expression>, Error> {
    match it.next() {
        Some(Token::Symbol(_, s)) =>
            Ok(Box::new(Expression::Symbol(
                SymbolInfo::new(s),
            ))),
        _  => Err(Error { msg: "expected a symbol".to_string() }),
    }
}
