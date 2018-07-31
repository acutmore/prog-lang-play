
use grammar::parse;
use scanner::scan;
use syntax::Expression;
use syntax::Expression::*;
use syntax::Mutable;
use syntax::MutationVisitor;

enum StdLibFunction {
    Identity,
}

struct StdLib {}

impl<'a> MutationVisitor<'a> for StdLib {
    fn visit_expression(&self, e: &'a mut Box<Expression>) -> &'a mut Box<Expression> {
        let replace_with = match **e {
            Symbol(ref s) => {
                match s.id.as_ref() {
                    "I" => Some(StdLibFunction::Identity),
                    _ => None,
                }
            },
            Function(_, ref mut body) => {
                body.accept_mutation(self);
                None
            },
            Application(_, _) => {
                if let Application(ref mut left, _) = **e {
                    left.accept_mutation(self);
                }
                if let Application(_, ref mut right) = **e {
                    right.accept_mutation(self);
                }
                None
            },
        };

        match replace_with {
            Some(StdLibFunction::Identity) => {
                *e = parse(scan("λx.x").unwrap()).unwrap();
            },
            None => {}
        }
        e
    }
}

/// Searches the given program for references to std lib functions
/// and adds the implementations to the tree.
/// The program with std lib functions added is returned
pub fn add_std_lib(program: & mut Box<Expression>) -> & mut Box<Expression> {
    let visitor = StdLib {};
    program.accept_mutation(&visitor)
}
