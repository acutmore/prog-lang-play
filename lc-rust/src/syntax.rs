
#[cfg(test)]
mod tests {
    use super::*;
    use self::Expression::*;

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
    fn it_can_build_an_ast() {
        let ast = Application(
            Box::new(Function(
                SymbolInfo::new("a"),
                Box::new(Symbol(SymbolInfo::new("b"))),
            )),
            Box::new(Symbol(SymbolInfo::new("c"))),
        );
        assert_eq!(
            ast.accept(&mut PrettyPrinter {}),
            "Apply(Func(a){Symbol(b)}, Symbol(c))",
        );
    }
}

pub struct SymbolInfo {
    pub id: String,
    pub at: u16,
    pub width: u16,
}

impl SymbolInfo {
    pub fn new<S>(s: S) -> SymbolInfo
    where S: Into<SymbolInfo> {
        s.into()
    }
}

impl From<(String, ::scanner::SrcPosition)> for SymbolInfo {
    fn from(item: (String, ::scanner::SrcPosition)) -> Self {
        SymbolInfo { id: item.0, at: item.1.index, width: item.1.width, }
    }
}

impl From<&'static str> for SymbolInfo {
    fn from(item: &'static str) -> Self {
        SymbolInfo { id: item.to_string(), at: 0, width: 0 }
    }
}

pub enum Expression {
    Symbol(SymbolInfo),
    Function(SymbolInfo, Box<Expression>),
    Application(Box<Expression>, Box<Expression>),
}

pub trait Visitor<T> {
    fn visit_expression(& mut self, &Expression) -> T;
}

impl Expression {
    pub fn accept<T>(&self, visitor: &mut Visitor<T>) -> T {
        visitor.visit_expression(self)
    }
}
