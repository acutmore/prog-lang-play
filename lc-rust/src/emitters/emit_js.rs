
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_emits_an_application() {
        let ast = Application(
            Box::new(Symbol(SymbolInfo::new("a"))),
            Box::new(Symbol(SymbolInfo::new("b"))),
        );
        assert_eq!(
            ast.accept(&mut JavascriptEmitter {}),
            "a(b)",
        );
    }

    #[test]
    fn it_emits_a_simple_program() {
        let ast = Application(
            Box::new(Function(
                SymbolInfo::new("a"),
                Box::new(Symbol(SymbolInfo::new("b"))),
            )),
            Box::new(Symbol(SymbolInfo::new("c"))),
        );
        assert_eq!(
            ast.accept(&mut JavascriptEmitter {}),
            "(a => b)(c)",
        );
    }

    #[test]
    fn it_emits_a_curried_function() {
        let ast = Function(
            SymbolInfo::new("a"),
            Box::new(Function(
                SymbolInfo::new("b"),
                Box::new(Symbol(SymbolInfo::new("c"))),
            ))
        );
        assert_eq!(
            ast.accept(&mut JavascriptEmitter {}),
            "a => b => c",
        );
    }
}

use syntax::*;
use syntax::Expression::*;

fn is_function(e: &Expression) -> bool {
    match e {
        &Function(_, _) => true,
        _ => false,
    }
}

pub struct JavascriptEmitter {}
impl Visitor<String> for JavascriptEmitter {
    fn visit_expression(&mut self, e: &Expression) -> String {
        match e {
            &Symbol(ref s) =>
                format!("{}", s.id),
            &Function(ref s, ref body) =>
                format!("{} => {}", s.id, body.accept(self)),
            &Application(ref left, ref right) => {
                let args = right.accept(self);
                let target = left.accept(self);
                let is_fn = is_function(left);

                if is_fn {
                    format!("({})({})", target, args)
                } else {
                    format!("{}({})", target, args)
                }
            },
        }
    }
}
