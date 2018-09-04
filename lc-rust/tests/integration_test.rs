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
fn it_compiles_programs_with_if_expressions() {
    assert_eq!(
        lc::transpile_js("if condition then a else b c").unwrap(),
        "(I => condition((_ => a))((_ => b(c)))(I))((x => x))"
    );
}

#[test]
fn it_includes_the_identity_function_in_the_std_lib() {
    assert_eq!(
        lc::transpile_js("(λf.g)(I)").unwrap(),
        "(I => (f => g)(I))((x => x))"
    );
}

#[test]
fn it_includes_ten_in_the_std_lib() {
    assert_eq!(
        lc::transpile_js("Ten").unwrap(),
        "(Ten => Ten)((f => (x => f(f(f(f(f(f(f(f(f(f(x)))))))))))))"
    );
}

#[test]
fn it_compiles_larger_numbers_to_a_compressed_church_numeral() {
    assert_eq!(
        lc::transpile_js("999").unwrap(),
        "(Ten => (f => (x => (f => (f => (x => f(f(f(f(f(f(f(f(f(x)))))))))))((f => (x => f(f(x))))(Ten)(f)))(f)((f => Ten((f => (x => f(f(f(f(f(f(f(f(f(x)))))))))))(f)))(f)((f => (x => f(f(f(f(f(f(f(f(f(x)))))))))))(f)(x))))))((f => (x => f(f(f(f(f(f(f(f(f(f(x)))))))))))))",
    );
}

#[test]
fn it_compiles_number_to_html() {
    assert_eq!(
        lc::transpile_html("10").unwrap(),
        "<span data-lc-start=\"0b0000000000000000\" data-lc-end=\"0b0000000000000010\">(Ten => (f => Ten((f => (x => f(x)))(f))))((f => (x => f(f(f(f(f(f(f(f(f(f(x)))))))))))))</span>"
    );
}

#[test]
fn it_compiles_small_program_to_html() {
    assert_eq!(
        lc::transpile_html("let x = 1 in x").unwrap(),
        "<span data-lc-start=\"0b0000000000000100\" data-lc-end=\"0b0000000000000101\">(x => </span><span data-lc-start=\"0b0000000000001101\" data-lc-end=\"0b0000000000001110\">x</span><span data-lc-start=\"0b0000000000000100\" data-lc-end=\"0b0000000000000101\">)</span>(<span data-lc-start=\"0b0000000000001000\" data-lc-end=\"0b0000000000001001\">(f => (x => f(x)))</span>)"
    );
}
