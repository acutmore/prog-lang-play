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
