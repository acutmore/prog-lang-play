
macro_rules! lc {
    // function
    (λ$symbol:tt.$($tail:tt)*) => {
        Box::new(
            ::syntax::Expression::Function(
                ::syntax::SymbolInfo::new($symbol),
                lc!($($tail)*),
            ),
        )
    };
    // application
    (($left:tt $right:tt)) => {
        Box::new(
            ::syntax::Expression::Application(
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
        Box::new(::syntax::Expression::Symbol(
            ::syntax::SymbolInfo::new($symbol)
        ))
    };
}

#[cfg(test)]
mod tests {
    use syntax::Visitor;
    use syntax::Expression;

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
    fn it_expands_to_a_symbol() {
        assert_eq!(
            lc!("a")
                .accept(&mut PrettyPrinter {}),
            "Symbol(a)",
        );
    }

    #[test]
    fn it_expands_to_simple_function() {
        assert_eq!(
            lc!(λ"a"."b")
                .accept(&mut PrettyPrinter {}),
            "Func(a){Symbol(b)}",
        );
    }

    #[test]
    fn it_expands_to_binary_function() {
        assert_eq!(
            lc!(λ"a".λ"b"."c")
                .accept(&mut PrettyPrinter {}),
            "Func(a){Func(b){Symbol(c)}}",
        );
    }

    #[test]
    fn it_expands_to_function_application() {
        assert_eq!(
            lc!(("a" "b"))
                .accept(&mut PrettyPrinter {}),
            "Apply(Symbol(a), Symbol(b))",
        );
    }
}
