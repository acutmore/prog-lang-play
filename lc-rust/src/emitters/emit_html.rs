
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_emits_a_simple_program() {
        let visitor = HTMLEmitter {};
        let ast = Application(
            Box::new(Function(
                SymbolInfo::new(("a".to_string(), 1)),
                Box::new(Symbol(SymbolInfo::new(("b".to_string(), 0)))),
            )),
            Box::new(Symbol(SymbolInfo::new(("c".to_string(), 3)))),
        );
        assert_eq!(
            ast.accept(&visitor),
            "<span data-lc-start=\"0b0000000000000001\" data-lc-end=\"0b0000000000000010\">(a => </span>b<span data-lc-start=\"0b0000000000000001\" data-lc-end=\"0b0000000000000010\">)</span>(<span data-lc-start=\"0b0000000000000011\" data-lc-end=\"0b0000000000000100\">c</span>)",
        );
    }
}

use syntax::*;
use syntax::Expression::*;

fn range_attributes(symbol: &SymbolInfo) -> String {
    format!("data-lc-start=\"{:#018b}\" data-lc-end=\"{:#018b}\"",
        symbol.at,
        symbol.at + (symbol.id.len() as u16)
    )
}

pub struct HTMLEmitter {}
impl Visitor<String> for HTMLEmitter {
    fn visit_expression(&self, e: &Expression) -> String {
        match e {
            &Symbol(ref s) => {
                if s.at == 0 {
                    format!("{}", s.id)
                } else {
                    format!("<span {}>{}</span>", range_attributes(s), s.id)
                }
            },
            &Function(ref s, ref body) => {
                if s.at == 0 {
                    return format!("({} => {})", s.id, body.accept(self));
                }
                let attributes = range_attributes(s);
                format!("<span {}>({} => </span>{}<span {}>)</span>",
                    attributes,
                    s.id,
                    body.accept(self),
                    attributes,
                )
            },
            &Application(ref left, ref right) =>
                format!("{}({})", left.accept(self), right.accept(self)),
        }
    }
}
