
use syntax::Expression;

/// Given an integer literal will return the coresponding church numeral.
/// Unlike get_church_numeral this will not reduce large numbers down into
/// shorter expressions. i.e. 999 will return a function with 999 calls to 'f'
fn get_plain_church_numeral(v: u32) -> Box<Expression> {
    match v {
        0 => lc!{λ"f".λ"x"."x"},
        _ => {
            let mut body = lc!{("f" "x")};
            for _ in 1..v {
                body = lc!{("f" body)}
            }
            lc!{λ"f".λ"x".body}
        }
    }
}

fn e10(digit: u32, place: u32) -> Box<Expression> {
    let digit = get_plain_church_numeral(digit);
    match place {
        0 => digit,
        1 => {
            // digit * 10
            lc!{λ"f".("Ten" (digit "f"))}
        },
        _ => {
            // digit * (10^place)
            let place_expression = get_plain_church_numeral(place);
            lc!{λ"f".(digit ((place_expression "Ten") "f"))}
        }
    }
}

enum AdditionPhase {
    Zero(),
    One(Box<Expression>),
    More(Box<Expression>),
}

fn add(value: Box<Expression>, progress: AdditionPhase) -> AdditionPhase {
    match progress {
        AdditionPhase::Zero() =>
            AdditionPhase::One(value),
        AdditionPhase::One(e) =>
            AdditionPhase::More(lc!{((value "f") ((e "f") "x"))}),
        AdditionPhase::More(e) =>
            AdditionPhase::More(lc!{((value "f") e)}),
    }
}

struct Digits {
    n: u32,
    place: u32,
}

impl Digits {
    fn new(n: u32) ->Digits {
        Digits { n, place: 0, }
    }
}

struct DigitAndPlace {
    digit: u32,
    place: u32,
}

impl Iterator for Digits {
    type Item = DigitAndPlace;

    fn next(&mut self) -> Option<DigitAndPlace> {
        let n = self.n;
        self.place += 1;
        if n == 0 {
            return None;
        }
        self.n = n / 10;
        Some(DigitAndPlace {digit: n % 10, place: self.place - 1,})
    }
}

fn set_position(pos: ::scanner::SrcPosition, n: Box<Expression>) -> Box<Expression> {
    let n = *n;
    if let Expression::Function(s, body) = n {
        let param = ::syntax::SymbolInfo {
            at: pos.index,
            width: pos.width,
            ..s
        };
        Box::new(Expression::Function(param, body))
    } else {
        Box::new(n)
    }
}

/// Given an integer literal will return the coresponding church numeral
pub fn get_church_numeral(v: u32, pos: ::scanner::SrcPosition) -> Box<Expression> {
    let mut value = AdditionPhase::Zero();
    for DigitAndPlace {digit, place} in Digits::new(v) {
        if digit == 0 {
            continue;
        }
        let place_value = e10(digit, place);
        value = add(place_value, value);
    }
    let n = match value {
        AdditionPhase::Zero() =>
            lc!{λ"f".λ"x"."x"},
        AdditionPhase::One(e) =>
            e,
        AdditionPhase::More(e) =>
            lc!{λ"f".λ"x".e},
    };
    set_position(pos, n)
}
