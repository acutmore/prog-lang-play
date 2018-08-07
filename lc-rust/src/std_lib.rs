
use syntax::Expression;
use syntax::Expression::*;
use syntax::Visitor;

#[derive(PartialEq)]
enum StdLibFunction {
    Identity,
    Ten,
}

struct StdLib {}

impl Visitor<Vec<StdLibFunction>> for StdLib {
    fn visit_expression(&self, e: &Expression) -> Vec<StdLibFunction> {
        match e {
            Symbol(ref s) => {
                match s.id.as_ref() {
                    "I" => vec![StdLibFunction::Identity],
                    "Ten" => vec![StdLibFunction::Ten],
                    _ => vec![],
                }
            },
            Function(_, ref body) => {
                body.accept(self)
            },
            Application(left, right) => {
                let mut left_vec = left.accept(self);
                let right_vec = right.accept(self);
                for fun in right_vec.into_iter() {
                    if !left_vec.contains(&fun) {
                        left_vec.push(fun);
                    }
                }
                return left_vec;
            },
        }
    }
}

/// Searches the given program for references to std lib functions
/// and adds the implementations to the tree.
/// The program with std lib functions added is returned
pub fn add_std_lib(program: Box<Expression>) -> Box<Expression> {
    let funs = program.accept(& StdLib {});
    let mut new_program = program;
    for fun in funs.into_iter() {
        let value = match fun {
            StdLibFunction::Identity => {
                lc!{λ"x"."x"}
            },
            StdLibFunction::Ten => {
                let ten_body =
                    lc!{("f" ("f" ("f" ("f" ("f" ("f" ("f" ("f" ("f" ("f" "x"))))))))))};
                lc!{λ"f".λ"x".ten_body}
            },
        };
        let name = match fun {
            StdLibFunction::Identity => "I",
            StdLibFunction::Ten => "Ten",
        };
        let f = lc!{λ(&name).new_program};
        new_program = lc!{(f value)};
    }
    return new_program;
}
