
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_emits_a_simple_program() {
        let visitor = JavascriptEmitter {};
        let ast = Application(
            Box::new(Function(
                SymbolInfo::new("a"),
                Box::new(Symbol(SymbolInfo::new("b"))),
            )),
            Box::new(Symbol(SymbolInfo::new("c"))),
        );
        assert_eq!(
            ast.accept(&visitor),
            "(a => b)(c)",
        );
    }
}

use syntax::*;
use syntax::Expression::*;

pub struct JavascriptEmitter {}
impl Visitor<String> for JavascriptEmitter {
    fn visit_expression(&self, e: &Expression) -> String {
        match e {
            &Symbol(ref s) =>
                format!("{}", s.id),
            &Function(ref s, ref body) =>
                format!("({} => {})", s.id, body.accept(self)),
            &Application(ref left, ref right) =>
                format!("{}({})", left.accept(self), right.accept(self)),
        }
    }
}
