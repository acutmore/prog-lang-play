
#[cfg(test)]
mod tests {
    use super::*;
    use scanner::SrcPosition;

    #[test]
    fn it_emits_a_simple_program() {
        let a = SymbolInfo::new((
            "a".to_string(),
            SrcPosition { line: 0, col: 0, index: 1, width: 1 }
        ));
        let b = SymbolInfo::new((
            "b".to_string(),
            SrcPosition { line: 0, col: 0, index: 0, width: 0 }
        ));
        let c = SymbolInfo::new((
            "c".to_string(),
            SrcPosition { line: 0, col: 0, index: 3, width: 1 }
        ));
        let ast = Application(
            Box::new(Function(a,  Box::new(Symbol(b)))),
            Box::new(Symbol(c)),
        );
        assert_eq!(
            ast.accept(&mut HTMLEmitter {}),
            "<span data-lc-start=\"0b0000000000000001\" data-lc-end=\"0b0000000000000010\">(a => </span>b<span data-lc-start=\"0b0000000000000001\" data-lc-end=\"0b0000000000000010\">)</span>(<span data-lc-start=\"0b0000000000000011\" data-lc-end=\"0b0000000000000100\">c</span>)",
        );
    }
}

use syntax::*;
use syntax::Expression::*;

fn range_attributes(symbol: &SymbolInfo) -> String {
    format!("data-lc-start=\"{:#018b}\" data-lc-end=\"{:#018b}\"",
        symbol.at,
        symbol.at + symbol.width,
    )
}

pub struct HTMLEmitter {}
impl Visitor<String> for HTMLEmitter {
    fn visit_expression(&mut self, e: &Expression) -> String {
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
