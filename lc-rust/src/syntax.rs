
#[cfg(test)]
mod tests {
    use super::*;
    use self::Expression::*;

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
    fn it_can_build_an_ast() {
        let visitor = PrettyPrinter {};
        let ast = Application(
            Box::new(Function(
                SymbolInfo::new("a"),
                Box::new(Symbol(SymbolInfo::new("b"))),
            )),
            Box::new(Symbol(SymbolInfo::new("c"))),
        );
        assert_eq!(
            ast.accept(&visitor),
            "Apply(Func(a){Symbol(b)}, Symbol(c))",
        );
    }
}

pub struct SymbolInfo {
    pub id: String,
    pub at: u16,
}

impl SymbolInfo {
    pub fn new<S>(s: S) -> SymbolInfo
    where S: Into<SymbolInfo> {
        s.into()
    }
}

impl From<(String, u16)> for SymbolInfo {
    fn from(item: (String, u16)) -> Self {
        SymbolInfo { id: item.0, at: item.1, }
    }
}

impl From<&'static str> for SymbolInfo {
    fn from(item: &'static str) -> Self {
        SymbolInfo { id: item.to_string(), at: 0, }
    }
}

pub enum Expression {
    Symbol(SymbolInfo),
    Function(SymbolInfo, Box<Expression>),
    Application(Box<Expression>, Box<Expression>),
}

pub trait Visitor<T> {
    fn visit_expression(&self, &Expression) -> T;
}

impl Expression {
    pub fn accept<T>(&self, visitor: &Visitor<T>) -> T {
        visitor.visit_expression(self)
    }
}

pub trait MutationVisitor<'a> {
    fn visit_expression(& self, &'a mut Box<Expression>) -> &'a mut Box<Expression>;
}

pub trait Mutable {
    fn accept_mutation<'a>(&'a mut self, visitor: &MutationVisitor<'a>) -> &'a mut Self;
}

impl Mutable for Box<Expression> {
    fn accept_mutation<'a>(&'a mut self, visitor: &MutationVisitor<'a>) -> &'a mut Self {
        visitor.visit_expression(self)
    }
}
