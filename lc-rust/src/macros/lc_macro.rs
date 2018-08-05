
#[allow(unused_imports)]
use syntax::Expression;
#[allow(unused_imports)]
use syntax::SymbolInfo;

macro_rules! lc {
    // function
    (λ$symbol:tt.$($tail:tt)*) => {
        Box::new(
            Expression::Function(
                SymbolInfo::new(($symbol).to_string()),
                lc!($($tail)*),
            ),
        )
    };
    // application
    (($left:tt $right:tt)) => {
        Box::new(
            Expression::Application(
                lc!($left),
                lc!($right),
            ),
        )
    };
    // symbol
    ($node:ident) => {
        $node
    };
    ($symbol:expr) => {
        Box::new(Expression::Symbol(
            SymbolInfo::new(($symbol).to_string())
        ))
    };
}

#[cfg(test)]
mod tests {
    use super::*;
    use syntax::Visitor;

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
    fn it_expands_to_a_symbol() {
        assert_eq!(
            lc!("a")
                .accept(&PrettyPrinter {}),
            "Symbol(a)",
        );
    }

    #[test]
    fn it_expands_to_simple_function() {
        assert_eq!(
            lc!(λ"a"."b")
                .accept(&PrettyPrinter {}),
            "Func(a){Symbol(b)}",
        );
    }

    #[test]
    fn it_expands_to_binary_function() {
        assert_eq!(
            lc!(λ"a".λ"b"."c")
                .accept(&PrettyPrinter {}),
            "Func(a){Func(b){Symbol(c)}}",
        );
    }

    #[test]
    fn it_expands_to_function_application() {
        assert_eq!(
            lc!(("a" "b"))
                .accept(&PrettyPrinter {}),
            "Apply(Symbol(a), Symbol(b))",
        );
    }
}
