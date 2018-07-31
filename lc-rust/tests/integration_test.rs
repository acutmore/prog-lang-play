//! End to end test compiling lc to ecmascript
extern crate lc;

#[test]
fn it_produces_unexpected_token_error() {
    assert_eq!(
        lc::transpile_js("((λi . i)(λt % t))").unwrap_err().msg,
        "Unexpected character: '%'"
    );
}

#[test]
fn it_generates_identity_function() {
    assert_eq!(
        lc::transpile_js("λa.a").unwrap(),
        "(a => a)"
    );
}

#[test]
fn it_generates_function_call() {
    assert_eq!(
        lc::transpile_js("a b").unwrap(),
        "a(b)"
    );
}

#[test]
fn it_generates_church_numerial_0() {
    assert_eq!(
        lc::transpile_js("0").unwrap(),
        "(f => (x => x))"
    );
}

#[test]
fn it_generates_church_numerial_1() {
    assert_eq!(
        lc::transpile_js("1").unwrap(),
        "(f => (x => f(x)))"
    );
}

#[test]
fn it_compiles_a_simple_program() {
    assert_eq!(
        lc::transpile_js("(λa.λb.a b) foo bar").unwrap(),
        "(a => (b => a(b)))(foo)(bar)"
    );
}

#[test]
fn it_compiles_programs_with_let_expressions() {
    assert_eq!(
        lc::transpile_js("let foo = bar in λf.x").unwrap(),
        "(foo => (f => x))(bar)"
    );
}

#[test]
fn it_compiles_programs_with_let_expressions_with_mutiple_values() {
    assert_eq!(
        lc::transpile_js("let foo = bar, car = zar in λf.x").unwrap(),
        "(foo => (car => (f => x))(zar))(bar)"
    );
}

#[test]
fn it_includes_the_identity_function_in_the_std_lib() {
    assert_eq!(
        lc::transpile_js("(λf.g)(I)").unwrap(),
        "(f => g)((x => x))"
    );
}
